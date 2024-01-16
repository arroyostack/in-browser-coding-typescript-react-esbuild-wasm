import * as esbuild from 'esbuild-wasm';
import { useEffect, useRef, useState } from "react";
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';


function App() {
  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState( '' );
  const [code, setCode] = useState( '' );

  // With 'service.transform' we will transpile user input code and show the result
  const startService = async () => {
    ref.current = await esbuild.startService( {
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    } );
  };

  useEffect( () => {
    startService();
  }, [] );

  const handleClick = async () => {
    if ( !ref.current ) return;

    iframe.current.srcdoc = html;

    const result = await ref.current.build( {
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [
        unpkgPathPlugin(),
        fetchPlugin( input )
      ],
      // Define eliminates warnings
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window'
      }
    } );

    // Send message
    iframe.current.contentWindow.postMessage( result.outputFiles[0].text, '*' );
  };

  const html: string = `
    <html>
      <head>
      </head>
      <body>
        <div id="root"></div>
        <script>  
        window.addEventListener( 'message', ( event ) => {
          try {
            eval(event.data)
          } catch (err) {
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color:red;" ><h4>Runtime Error</h4>' + err + '</h4></div>'
            console.error(err);
          }
        }, false );
        </script>
      </body>
    </html>
  `;



  return (
    <div>
      <textarea
        value={ input }
        onChange={ event => setInput( event.target.value ) }
      />

      <div>
        <button
          onClick={ handleClick }
        >Submit</button>
      </div>

      <pre>{ code }</pre>

      {/* Sand box code editor */ }
      <iframe
        title="CodePreview"
        sandbox="allow-scripts"
        srcDoc={ html }
        ref={ iframe }
      ></iframe>
    </div>
  );
}


export default App;
