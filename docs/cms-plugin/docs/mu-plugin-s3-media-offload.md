# MaterialDistrict S3 Media Offload mu-plugin

Deze mu-plugin staat in `mu-plugins/md-s3-media-offload.php` en is bedoeld voor
de nieuwe non-multisite CMS-installatie. De bestaande uploadhistorie staat in:

```text
s3://materialdistrict-media/wp-content/uploads/
```

`uploads/sites/` is bewust niet meegenomen.

## Eerste veilige configuratie

Zet de plugin eerst aan voor URL-rewrite, maar laat nieuwe uploads nog niet naar
S3 schrijven totdat CloudFront en AWS-credentials klaarstaan:

```php
define( 'MD_MEDIA_CDN_URL', 'https://media.materialdistrict.com/wp-content/uploads' );
define( 'MD_MEDIA_REWRITE_ENABLED', true );
define( 'MD_MEDIA_S3_UPLOADS_ENABLED', false );
define( 'MD_MEDIA_S3_BUCKET', 'materialdistrict-media' );
define( 'MD_MEDIA_S3_REGION', 'eu-central-1' );
define( 'MD_MEDIA_S3_PREFIX', 'wp-content/uploads' );
```

Met deze stand:
- blijven uploads lokaal werken;
- worden Media Library URLs, `srcset`, content en REST-response strings herschreven
  naar `media.materialdistrict.com`;
- kan rollback door `MD_MEDIA_REWRITE_ENABLED` op `false` te zetten.

## Nieuwe uploads naar S3

Als CloudFront werkt en de server AWS write-credentials heeft, kan upload-offload
aan:

```php
define( 'MD_MEDIA_S3_UPLOADS_ENABLED', true );
define( 'MD_MEDIA_REMOVE_LOCAL_AFTER_UPLOAD', false );
define( 'MD_MEDIA_S3_DELETE_REMOTE', false );
```

Laat `MD_MEDIA_REMOVE_LOCAL_AFTER_UPLOAD` in het begin op `false`, zodat de eerste
testuploads zowel lokaal als in S3 bestaan. Zet dit pas op `true` als bewerken,
thumbnailgeneratie, REST-output en frontend-weergave goed getest zijn.

De plugin leest credentials uit constants of environment variables:

```php
define( 'MD_MEDIA_AWS_ACCESS_KEY_ID', '...' );
define( 'MD_MEDIA_AWS_SECRET_ACCESS_KEY', '...' );
```

Of:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
```

## Minimale IAM policy voor WordPress

Gebruik een aparte IAM user/access key voor de DigitalOcean CMS-server:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::materialdistrict-media"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::materialdistrict-media/wp-content/uploads/*"
    }
  ]
}
```

Als `MD_MEDIA_S3_DELETE_REMOTE` uit blijft, kan `s3:DeleteObject` later worden
toegevoegd.

## CloudFront

Gebruik een private S3 bucket achter CloudFront met Origin Access Control. De
bucket hoeft niet publiek te worden. Stel `media.materialdistrict.com` als
alternate domain name in en gebruik een ACM-certificaat in `us-east-1`.

De plugin verwacht dat deze URL werkt:

```text
https://media.materialdistrict.com/wp-content/uploads/<year>/<month>/<file>
```

Huidige AWS-resources:

```text
S3 bucket: materialdistrict-media
S3 prefix: wp-content/uploads/
CloudFront distribution ID: E1YTMVOIO4EN9K
CloudFront default domain: d3446svifjvd3n.cloudfront.net
CloudFront OAC ID: EZWYU9RJART6A
ACM certificate ARN: arn:aws:acm:us-east-1:907631133702:certificate/9b6a3613-45f8-4118-b26b-8b144287ce96
```

DNS-validatie voor het ACM-certificaat:

```text
Type: CNAME
Name: _e6050e762b2323ded260ffd9539ceab8.media.materialdistrict.com
Value: _516288dc221efdef6806556ec2205770.jkddzztszm.acm-validations.aws
```

Na certificaat-validatie kan de CloudFront distribution worden bijgewerkt met
de alias `media.materialdistrict.com`. Daarna kan DNS naar CloudFront wijzen:

```text
Type: CNAME
Name: media
Value: d3446svifjvd3n.cloudfront.net
```

## Installatie

Kopieer het bestand naar de mu-plugin map van de WordPress-installatie:

```bash
mkdir -p /var/www/html/wp-content/mu-plugins
cp md-s3-media-offload.php /var/www/html/wp-content/mu-plugins/
```

Daarna `wp-config.php` constants toevoegen en testen:

```bash
wp eval 'echo wp_get_upload_dir()["baseurl"] . PHP_EOL;' --allow-root
wp media import /tmp/test-image.jpg --title='S3 offload test' --allow-root
wp post delete <attachment_id> --force --allow-root
```
