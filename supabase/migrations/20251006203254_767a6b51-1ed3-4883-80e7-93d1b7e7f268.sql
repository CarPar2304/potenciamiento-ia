-- Enable Row Level Security on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to read documents
CREATE POLICY "Only admins can view documents"
ON public.documents
FOR SELECT
USING (get_user_role() = 'admin');

-- Create policy to allow only admins to insert documents
CREATE POLICY "Only admins can insert documents"
ON public.documents
FOR INSERT
WITH CHECK (get_user_role() = 'admin');

-- Create policy to allow only admins to update documents
CREATE POLICY "Only admins can update documents"
ON public.documents
FOR UPDATE
USING (get_user_role() = 'admin');

-- Create policy to allow only admins to delete documents
CREATE POLICY "Only admins can delete documents"
ON public.documents
FOR DELETE
USING (get_user_role() = 'admin');