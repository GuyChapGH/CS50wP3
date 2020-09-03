document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Listen for submit form
  document.querySelector('form').onsubmit = () => {
      // Capture values from form
      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

      // Send email using API
      fetch ('/emails', {
          method: 'POST',
          body: JSON.stringify({
              recipients:`${recipients}`,
              subject:`${subject}`,
              body:`${body}`
          })
      })
      .then(response=> response.json())
      .then(result => {
          // Print result
          console.log(result);
      });

      // Load user's SENT mailbox HERE.
      load_mailbox('sent');

      // Prevent default submission of form
      return false;

    }

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails using API

  fetch (`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // Do something else with emails
      emails.forEach(add_email_header);

  });

    // Add a new email_header with given contents to DOM
    function add_email_header(contents)    {
        // Create new email_header
        const email_header = document.createElement('div');
        email_header.className='emailHeader';
        // Set background-color to grey if email has been read
        if (contents.read)  {
            email_header.style.background = 'gray';
        }
        email_header.innerHTML = '<span class="left">' + '<b>' + contents.sender + '</b>' + '  ' + contents.subject + '</span>' + '<span class = "right">' + contents.timestamp + '</span>';
        //Add email_header to DOM
        document.querySelector('#emails-view').append(email_header);
    }


}
