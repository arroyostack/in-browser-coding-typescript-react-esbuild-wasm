import { useState } from "react";


function App() {
  const [input, setInput] = useState( '' );
  const [code, setCode] = useState( '' );

  const handleClick = () => {
    console.log( input );
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
