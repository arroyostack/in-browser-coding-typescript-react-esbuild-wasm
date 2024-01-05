import * as esbuild from 'esbuild-wasm';
import { useEffect, useRef, useState } from "react";


function App() {
  const ref = useRef<any>();
  const [input, setInput] = useState( '' );
  const [code, setCode] = useState( '' );

  // With 'service.transform' we will transpile user input code and show the result
  const startService = async () => {
    ref.current = await esbuild.startService( {
      worker: true,
      wasmURL: '/esbuild.wasm'
    } );
  };

  useEffect( () => {
    startService();
  }, [] );

  const handleClick = () => {
    if ( !ref.current ) return;
    ref.current.transform( input, {
      loader: 'jsx',
      target: 'es2015'
    } );
  };

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
    </div>
  );
}

export default App;
