# File Upload to GCS


### Configure the uploads bucket on GCS

* Create a [Google Cloud Project](https://console.cloud.google.com), and 
  [configure billing](https://console.cloud.google.com/billing).
* [Create a storage bucket](https://console.cloud.google.com/storage/browser).  
* Create a [service account](https://console.cloud.google.com/iam-admin/serviceaccounts), with a name such as `filemanager@yourproject.
  iam.gserviceaccount.com`, where `filemanager` is the name of the "user" for the account, and `yourproject` is the name of the service account. 
* Download the json credentials for the above service account, and store them in a file in `private/gcs_keys.json` in this app.  Make sure the file is also in `.gitignore`!
* Go to the [Google Cloud Console, then to Storage, then to Browse](https://console.cloud.google.com/storage/browser).  Click 
  on the bucket options on the right, then on _permissions_, and add the 
  service account with the permission _Storage Object Admin_ to the bucket permissions. 
* Set up the bucket for CORS.  [Install `gsutils` if needed](https://cloud.
  google.com/storage/docs/gsutil_install), then do:
  
  
    gsutil cors set documentation/cors_json_file.json gs://bucketname

  where of course bucketname is the name of the bucket you created. 

### Notes

Due to an old Python on my Mac I had to do:

    export CLOUDSDK_PYTHON="/Users/path/to/anaconda3/envs/myenv/bin/python"
