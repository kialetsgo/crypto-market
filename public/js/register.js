'use strict'
let password = document.getElementById('password')
let password2 = document.getElementById('password2')
let regButton = document.getElementById('register-button')

regButton.addEventListener('click', (e) => {

    if (password.value !== password2.value) {
        alert('Passwords do not match')
        e.preventDefault();
    }
})