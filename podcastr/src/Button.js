import { useState } from 'react';

export default function Button(props) {

    const [counter, setCounter] = useState(1);

    // [estado, alterarEstado]



    function increment() {
        setCounter(counter + 1);
        console.log(counter);
    }
    return ( 
        <>
            <span>{counter}</span>
            <button onClick={increment}>{props.children}</button>
            <br />
        </>

    )
}