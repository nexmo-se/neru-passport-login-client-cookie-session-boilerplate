## Neru Passport Local Stratefy Authentication using Client Cookie Sessions

This demo shows how to create a passport based authentication using client session cookies.
Neru, as stated by their devs, is stateless. Any session stored server side can disapear anytime. Using client cookie sessions fixes this.

Just run and login.

Note that "passport" needs to be version 0.5.3 as version 6 still has issues with cookie-sessions

You can run this via "npm index.js"
Or, deploy to neru
Using "neru debug" will cause the login to not work, there seems to be an issue with https/http calls on debug. Deploy works fine

## This code uses the Neru Serverless Platform
As such, neru needs to be initialized to run this

Read up here: https://vonage-neru.herokuapp.com/neru/overview
