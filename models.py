"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

# This table stores the upload for each user.  We pretend that each
# user can have one upload at most; you can modify the code any way
# you like.
db.define_table(
    'upload',
    Field('owner', default=get_user_email),
    Field('file_name'),
    Field('file_type'),
    Field('file_date'),
    Field('file_path'),
    Field('file_size', 'integer'),
    Field('confirmed', 'boolean', default=False), # Was the upload to GCS confirmed?
)

db.commit()
