const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.has('session_id')) {
    const session = urlParams.get('session_id');
    const sessionId = atob(session)
    console.log('session -> ' + session + ' -> ' + sessionId);

    document.getElementById("login").style.display = "none";
    document.getElementById("session_id").innerHTML = sessionId;
    document.getElementById("session_id").style.display = "block";
} else if(urlParams.has('login_failed')) {
    document.getElementById("session_id").innerHTML = "Login Failed";
} else {
    document.getElementById("session_id").style.display = "none";
    document.getElementById("login").style.display = "block";
}