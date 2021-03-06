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
  document.querySelector('#email-display').style.display = 'none';

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

          //Error handling
          if (result.message !== undefined) {
              // Print result
              console.log(result);

          } else {
              alert ('Error: ' + result.error);
          }

      })

      //Load Sent Mailbox when POST request is completed
         .then(() => {
              load_mailbox('sent');
          });

      // Load user's SENT mailbox HERE.
      //load_mailbox('sent');

      // Prevent default submission of form
      return false;

    }

}



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails using API
  fetch (`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

          // Print emails
          console.log(emails);

          // Call add_email_header function for each email
          emails.forEach(add_email_header);

  });

    // Add a new email_header with given contents to DOM
    function add_email_header(contents)    {

        // Create new email_header
        const email_header = document.createElement('div');

        //Store email id in div
        email_header.dataset.id = contents.id;

        //Style header
        email_header.className='emailHeader';

        // Set background-color to grey if email has been read
        if (contents.read)  {
            email_header.style.background = 'gray';
        }

        //Add HTML and style content
        email_header.innerHTML = '<span class="left">' + '<b>' + contents.sender +
                                '</b>' + '  ' + contents.subject + '</span>' +
                                '<span class = "right">' + contents.timestamp + '</span>';

        // Add event handler and load_email if clicked on
        email_header.addEventListener('click', () => load_email(email_header.dataset.id));

        //Add email_header to DOM
        document.querySelector('#emails-view').append(email_header);
    }



    function load_email(id)   {

        // Show the email contents and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#email-display').style.display = 'block';


        //Load email using API
        fetch (`/emails/${id}`)
        .then(response => response.json())
        .then(email => {

            //Clear any previous content from the div
            const prev_email_contents = document.querySelector('#email-display');
            prev_email_contents.innerHTML = '';


            //Create new email_contents div
            const email_contents = document.createElement('div');

            //Add HTML and style contents
            email_contents.innerHTML = '<b>' + "From: " + '</b>' + email.sender + '<br>' +
                                    '<b>' + "To: " + '</b>' + email.recipients + '<br>' +
                                    '<b>' + "Subject: " + '</b>' + email.subject + '<br>' +
                                    '<b>' + "Timestamp: " + '</b>' + email.timestamp + '<hr>' +
                                    email.body;



            //Add email_contents to DOM
            document.querySelector('#email-display').append(email_contents);

            //Mark email as read by call to API
            fetch (`/emails/${id}`, {
                method:'PUT',
                body: JSON.stringify({
                    read: true
                })
            });

            //Reply button feature
            const reply_btn = document.createElement('button');
            reply_btn.innerHTML = "Reply";
            reply_btn.className = "btn btn-sm btn-outline-primary";

            reply_btn.addEventListener('click', function()    {

            //Call compose_email form
            compose_email()

            //Pre-fill compose_email form
            document.querySelector('#compose-recipients').value = email.sender;

            //Test to see if first four characters are 'Re: ', if not add them
            if (email.subject.substring(0,4) !== 'Re: ')    {
                document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
            } else {
                document.querySelector('#compose-subject').value = email.subject;
            }

            //Pre fill body of email reply
            document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender +
                                                            ' wrote: ' + email.body;

            });

            //Add reply button to div
            document.querySelector('#email-display').append(reply_btn);

            //Archive button and 'PUT' API code
            if (mailbox ==="inbox") {
                const btn = document.createElement('button');
                btn.innerHTML = "Archive";
                btn.className = "btn btn-sm btn-outline-primary";

                btn.addEventListener('click', function()    {

                    //Mark email as archived by call to API
                    fetch (`/emails/${id}`, {
                        method:'PUT',
                        body: JSON.stringify({
                            archived: true
                        })
                    })

                    //Load Inbox when PUT request is completed
                    .then(response => load_mailbox('inbox'));

                });

                //Add Archive button to div
                document.querySelector('#email-display').append(btn);

            }

            //Unarchive button and 'PUT' API code
            if (mailbox ==="archive") {
                const btn = document.createElement('button');
                btn.innerHTML = "Unarchive";
                btn.className = "btn btn-sm btn-outline-primary";

                btn.addEventListener('click', function()    {

                    //Mark email as unarchived by call to API
                    fetch (`/emails/${id}`, {
                        method:'PUT',
                        body: JSON.stringify({
                            archived: false
                        })
                    })

                    //Load inbox when PUT request completed
                    .then(response => load_mailbox('inbox'));

                });

                //Add Unarchive button to div
                document.querySelector('#email-display').append(btn);

            }


        });

    }

}
