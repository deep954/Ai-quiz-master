import React from 'react';

export const AdBanner: React.FC = () => {
  const adCode = `
    <script type="text/javascript">
      atOptions = {
        'key' : 'cca0687aaf7858a2989a8fd127c46cf6',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="//www.highperformanceformat.com/cca0687aaf7858a2989a8fd127c46cf6/invoke.js"></script>
  `;

  return (
    <div className="w-full flex justify-center my-6">
      <div className="rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm border border-white/20">
        <iframe
          title="Advertisement"
          srcDoc={`
            <html>
              <head>
                <style>
                  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
                </style>
              </head>
              <body>
                ${adCode}
              </body>
            </html>
          `}
          width="468"
          height="60"
          style={{ border: 'none', maxWidth: '100%', display: 'block' }}
          scrolling="no"
        />
      </div>
    </div>
  );
};
