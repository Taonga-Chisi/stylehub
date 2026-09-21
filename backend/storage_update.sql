-- Create a new public bucket for salon images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('salon-images', 'salon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Anyone can view salon images
CREATE POLICY "Public can view salon images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'salon-images' );

-- Policy 2: Authenticated users can upload salon images
CREATE POLICY "Authenticated users can upload salon images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'salon-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can update their own uploads
CREATE POLICY "Users can update their own salon images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'salon-images' 
  AND auth.uid() = owner
);
