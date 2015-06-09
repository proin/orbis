<?php
    echo "<br><b>Your User Agent is</b>: " . $_SERVER ['HTTP_USER_AGENT'] . "<br>";
    echo "<br><b>Your GET is</b>: " . $_GET['get'] . "<br>";
    echo "<br><b>Your POST is</b>: " . $_POST['post'] . "<br><hr><br>";

    foreach($_SERVER as $key => $value) {
        echo '['. $key . '] => ' . $value . '<br/>';
    }
?>