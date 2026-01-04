import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';

export const createUploader = (options) => {
  const uppy = new Uppy({
    meta: { type: 'avatar' },
    restrictions: {
      maxNumberOfFiles: 1,
      allowedFileTypes: ['image/*'],
    },
    autoProceed: true,
  });

  uppy.use(AwsS3, {
    async getUploadParameters(file) {
      const response = await fetch('/api/uploads/request-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload parameters');
      }

      const data = await response.json();
      return {
        method: 'PUT',
        url: data.uploadURL,
        headers: {
          'Content-Type': file.type,
        },
      };
    },
  });

  uppy.on('upload-success', (file, response) => {
    const objectPath = file.meta.objectPath;
    if (options.onSuccess) {
      options.onSuccess(objectPath);
    }
  });

  uppy.on('error', (error) => {
    if (options.onError) {
      options.onError(error);
    }
  });

  return uppy;
};
