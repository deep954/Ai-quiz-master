import React, { useEffect } from 'react';

export const AdsterraNativeAd: React.FC = () => {
  useEffect(() => {
    const scriptId = 'adsterra-native-script';
    
    // Prevent injecting the script multiple times
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = "//pl28136636.effectivegatecpm.com/70007dc856fed010a865a7f4ff816259/invoke.js";
      
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-4">
       {/* The ad script targets this specific container ID */}
       <div id="container-70007dc856fed010a865a7f4ff816259"></div>
    </div>
  );
};