import { useRef, useState } from "react";

const usePhotoGallery = () => {
  const [blobUrl, setBlobUrl] = useState(null);
  const fileInputRef = useRef(null);

  const takePhoto = () => {
    // Create a hidden file input if it doesn't exist
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          console.log("Image selected:", url);
          setBlobUrl(url);
        }
      };
      
      fileInputRef.current = input;
      document.body.appendChild(input);
    }
    
    // Trigger file selection dialog
    fileInputRef.current.click();
  };

  return { takePhoto, blobUrl };
};

export default usePhotoGallery;
