# Configure MIME types for static files served by Rack::Static
# This is necessary for PWA manifest files to be served with the correct MIME type

# Register the webmanifest MIME type with Rack
Rack::Mime::MIME_TYPES[".webmanifest"] = "application/manifest+json"
