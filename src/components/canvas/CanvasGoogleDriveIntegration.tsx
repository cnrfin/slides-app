// src/components/canvas/CanvasGoogleDriveIntegration.tsx
// Updated Google Drive integration for Canvas using secure service

import { googleDriveSecureService } from '@/services/googleDriveSecure';
import { toast } from '@/utils/toast';
import { exportSlidesToPDF } from '@/utils/pdf-export';

interface GoogleDriveExportProps {
  slides: any[];
  presentation: any;
  slideOrder?: string[];
}

export const handleGoogleDriveExport = async ({
  slides,
  presentation,
  slideOrder
}: GoogleDriveExportProps) => {
  try {
    // Check if Google Drive is connected
    const isConnected = await googleDriveSecureService.isConnected();
    
    if (!isConnected) {
      // Prompt user to connect
      const userChoice = window.confirm(
        'Google Drive is not connected. Would you like to connect now?'
      );
      
      if (userChoice) {
        const connected = await googleDriveSecureService.connect();
        if (!connected) {
          toast.error('Failed to connect to Google Drive');
          return;
        }
      } else {
        return;
      }
    }

    const toastId = toast.loading('Preparing to save to Google Drive...');
    
    try {
      // Generate PDF blob
      const pdfBlob = await exportSlidesToPDF({
        slides,
        slideOrder,
        returnBlob: true,
        onProgress: (progress) => {
          toast.loading(`Generating PDF... ${Math.round(progress)}%`, toastId);
        }
      });
      
      // Generate filename
      const fileName = presentation?.title ? 
        `${presentation.title}_${new Date().toISOString().split('T')[0]}.pdf` : 
        `presentation_${new Date().toISOString().split('T')[0]}.pdf`;
      
      toast.loading('Uploading to Google Drive...', toastId);
      
      // Upload to Drive using secure service
      const result = await googleDriveSecureService.uploadToDrive(
        pdfBlob,
        fileName,
        'application/pdf'
      );
      
      toast.success('Saved to Google Drive successfully!', toastId);
      
      // Open the file in Drive
      if (result.id) {
        const openInDrive = window.confirm(
          'File uploaded successfully! Would you like to open it in Google Drive?'
        );
        
        if (openInDrive) {
          window.open(`https://drive.google.com/file/d/${result.id}/view`, '_blank');
        }
      }
    } catch (uploadError: any) {
      console.error('Upload error:', uploadError);
      
      // Check if it's an authentication error
      if (uploadError.message?.includes('401') || uploadError.message?.includes('Invalid Credentials')) {
        toast.error('Authentication expired. Please reconnect Google Drive.', toastId);
        
        // Try to reconnect
        const reconnect = window.confirm(
          'Your Google Drive session has expired. Would you like to reconnect?'
        );
        
        if (reconnect) {
          const connected = await googleDriveSecureService.connect();
          if (connected) {
            toast.success('Reconnected! Please try saving again.');
          }
        }
      } else {
        toast.error('Failed to save to Google Drive. Please try again.', toastId);
      }
    }
  } catch (error) {
    console.error('Failed to save to Drive:', error);
    toast.error('An unexpected error occurred. Please try again.');
  }
};

// Export a component that can be used in the Canvas
export const GoogleDriveButton = ({ slides, presentation, slideOrder }: GoogleDriveExportProps) => {
  return (
    <button
      onClick={() => handleGoogleDriveExport({ slides, presentation, slideOrder })}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2L3 8L12 22L15 16L6 2Z" fill="#1EA362"/>
        <path d="M18 2H6L15 16H21L18 2Z" fill="#4285F4"/>
        <path d="M21 8H12L9 14L3 8L12 22L21 8Z" fill="#FFBA00"/>
      </svg>
      Save to Google Drive
    </button>
  );
};