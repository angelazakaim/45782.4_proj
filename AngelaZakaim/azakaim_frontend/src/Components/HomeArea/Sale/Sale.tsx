import "./Sale.css";

export function Sale() {

    function isWeekend():boolean{
        return new Date().getDay() >= 5;
    }

    // let num1 = 2, num2 = 0;
    // if(num1 % 2 == 0)
    //     num2 = 1;
    // else
    //     num2 = 0;

    // num2 = num1%2==0 ? 1 : 0; // ternary
    
    return (
        <div className="Sale box">
            
            {isWeekend() && <p>Mega sale on weekend! 50% off!!</p>}
            
            <p>
            {isWeekend()? 'Mega sale on weekend! 50% off!!' : "Don't shop today - Sale over the next weekend!"}
            </p>
        </div>
    );
}
