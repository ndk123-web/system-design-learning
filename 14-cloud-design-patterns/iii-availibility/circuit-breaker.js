// OPEN = Means Block Service Calling For 5 Seconds 
// CLOSED = All Is Good We Can Call Service
// HALF OPENED = TESTING IF FAIL THEN failure() else success()

class CircuitBreaker {
    constructor() {
        this.state = "OPEN";
        this.failureCount = 0;
        this.failureThreshold = 3;
        this.openTimeout = 5000; // 5 seconds
        this.lastFailureTime = null;
    }

    canRequest() {
        if (this.state == "OPEN") {
            const now = Date.now()

            if (now - this.lastFailureTime > this.openTimeout) {
                this.state = "HALF OPEN"
                return true
            }
            return false
        }
        return true;
    }

    success() {
        this.failureCount = 0
        this.state = "CLOSED"
    }

    failure() {
        this.failureCount++
        if (this.failureCount >= this.failureThreshold) {
            this.state = "OPEN"
            this.lastFailureTime = Date.now()
        }
    }
}

const circuitBreaker = new CircuitBreaker()
// console.log(circuitBreaker)


async function serviceA() {
    // STEP 1: check circuit
    if (!circuitBreaker.canRequest()) {
        return {
            status: 503,
            message: "Service temporarily unavailable (circuit open)"
        };
    }

    try {
        // STEP 2: actual service-to-service call
        const response = await serviceB();

        // STEP 3: success
        circuitBreaker.success();

        return {
            status: 200,
            message: response
        };
    } catch (err) {
        // STEP 4: failure
        circuitBreaker.failure();

        return {
            status: 500,
            message: "Failed calling service B"
        };
    }
}

async function serviceB() {
    // imagine this is HTTP call
    // sometimes fails
    if (Math.random() < 0.6) {
        throw new Error("Service B failed");
    }
    return "Payment success";
}



async function Call() {
    for (let i = 0; i < 10; i++) {
        const res = await serviceA()
        console.log(res)
    }
}

Call()