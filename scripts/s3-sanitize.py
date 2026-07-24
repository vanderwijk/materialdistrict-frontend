#!/usr/bin/env python3
"""
S3-hernoeming voor media-sanering — werkt op de ECHTE S3-keys via boto3.

De database bevat verminkte '?' waar het bestand in werkelijkheid een 4-byte
teken (emoji) heeft; S3 heeft de echte naam. We kunnen de S3-keys dus niet uit
de DB afleiden. Daarom:

  - lijst de ECHTE objecten onder de betrokken prefixes (uit md-s3-moves.tsv);
  - hernoem elk object met een 4-byte teken (= precies de set die in de DB tot
    '?' verminkte) naar de schone naam (onveilig -> '-'). Accenten/LTR-mark
    (BMP, 2-3 byte) blijven met rust;
  - boto3 CopySource={'Bucket','Key'} encodeert emoji/@/etc. correct.

Idempotent. Vereist boto3 (pip3 install boto3); gebruikt dezelfde AWS-creds
als de aws-CLI.

Draaien vanuit de map met md-s3-moves.tsv:
    python3 s3-sanitize.py
"""
import os
import re

import boto3
from botocore.exceptions import ClientError

BUCKET = "materialdistrict-media"
REGION = "eu-central-1"
TSV = "md-s3-moves.tsv"
SAFE = re.compile(r"[^A-Za-z0-9._/-]+")

os.chdir(os.path.dirname(os.path.abspath(__file__)))
s3 = boto3.client("s3", region_name=REGION)


def simple_clean(key):
    key = SAFE.sub("-", key)
    out = []
    for seg in key.split("/"):
        if "." in seg:
            i = seg.rfind(".")
            stem, ext = seg[:i], seg[i:]
        else:
            stem, ext = seg, ""
        stem = re.sub(r"-{2,}", "-", stem).strip("-_.") or "file"
        out.append(stem + ext)
    return "/".join(out)


def has_astral(s):
    """Bevat een 4-byte teken (buiten de BMP) = de '?'-verminkte set (emoji)."""
    return any(ord(c) > 0xFFFF for c in s)


# Betrokken prefixes (datum-mappen) uit kolom 2 van de tsv.
prefixes = set()
with open(TSV, encoding="utf-8") as fh:
    for line in fh:
        cols = line.rstrip("\n").split("\t")
        if len(cols) == 2 and cols[1]:
            prefixes.add(cols[1].rsplit("/", 1)[0] + "/")

renamed = left_alone = fail = 0
paginator = s3.get_paginator("list_objects_v2")

for pfx in sorted(prefixes):
    for page in paginator.paginate(Bucket=BUCKET, Prefix=pfx):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if not has_astral(key):
                left_alone += 1
                continue
            new = simple_clean(key)
            if new == key:
                continue
            try:
                s3.copy_object(
                    Bucket=BUCKET,
                    Key=new,
                    CopySource={"Bucket": BUCKET, "Key": key},
                )
                s3.delete_object(Bucket=BUCKET, Key=key)
                renamed += 1
            except ClientError as e:
                print("FAIL:", key, "->", new, "|", e.response["Error"]["Code"])
                fail += 1

print(f"klaar — hernoemd: {renamed}, met rust gelaten (geen emoji): "
      f"{left_alone}, mislukt: {fail}")
