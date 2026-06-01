+++
type = 'capture'
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'

objects = [''] # e.g., ['Sadr', 'IC 1318']
tags = [''] # e.g., ['nebula', 'emission', 'Ha']

# Image
capture_image_path = '' # e.g., 'images/2026-04-18.jpg' — full-res capture
capture_image_thumb_path = '' # e.g., 'images/2026-04-18-thumb.jpg' — gallery tile (~1024x683)
capture_alt = '' # accessible description of the image

# Identification (shown in the gallery card + view page header)
capture_object_subtitle = '' # short common name shown under the title, e.g., 'Sadr Region', 'M31'
capture_object_type = ''     # e.g., 'Emission Nebula', 'Spiral Galaxy', 'Open Cluster', 'Lunar'
capture_designation = ''     # catalog ID, e.g., 'IC 1318', 'NGC 224' (or '—' for lunar)

# Field notes — write a sentence or two in the body below.

# Acquisition
capture_date = '{{ .Date }}'
capture_location = '' # e.g., 'Dod Mill Farm'
capture_bortle_scale = 0
capture_camera = 'Canon EOS 550D'
capture_frames = 0           # subframe count
capture_exposure = ''        # e.g., '30s', '1/200s'
capture_iso = 0
capture_f_number = 0
capture_focal_length = 0
capture_mount = 'SkyWatcher Star Adventurer 2i EQ'
capture_integration = ''     # human-readable total, e.g., '52.5m', '1h 48m' (use '—' for single-frame)

# Coordinates
capture_ra_hms = ''  # e.g., '20h 37m 51.322s'  (use '—' for lunar)
capture_dec_dms = '' # e.g., '+40° 15′ 18″'     (use '—' for lunar)
+++

This part of the content serves as the description for the capture. Keep it to one or two sentences — it appears as field notes on the view page.
