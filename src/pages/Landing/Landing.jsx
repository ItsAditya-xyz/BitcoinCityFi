import React, { useEffect } from 'react';

function Landing(props) {

    useEffect(() => {
       //route to /0x26b131763413838375b4b6adb149c59e43cd4445
       window.location.href = "/address/0x26b131763413838375b4b6adb149c59e43cd4445";
    }, []);
    return (
        <div>
            
        </div>
    );
}

export default Landing;