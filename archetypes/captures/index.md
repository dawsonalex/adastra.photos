+++
type = 'capture'
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'

objects = [''] # e.g., ['Sadr', 'IC 1318']
tags = [''] # e.g., ['nebula', 'emission', 'Ha']

# TODO: Change the format here to snake case and add an image alt field
# Capture specific fields
capture_image_path = '' # e.g., 'images/2019-01-01-00-00-00.jpg'
capture_image_thumb_path = '' # e.g., 'images/2019-01-01-00-00-00-thumb.jpg' recommended size 1024x512
capture_location = '' # e.g., 'Dod Mill Farm'
capture_date = '{{ .Date }}'
capture_camera = 'Canon EOS 550D'
capture_frames = 0
capture_exposure = 0
capture_iso = 0
capture_f_number = 0
capture_mount = 'SkyWatcher Sky Adventurer 2i EQ'
capture_ra_hms = '20h 37m 51.322s'
capture_focal_length = 0
capture_bortle_scale = 0
+++

This Part of the content serves as the description for the capture. 