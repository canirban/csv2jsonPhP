<?php
    header('Access-Control-Allow-Origin: *');

    header('Access-Control-Allow-Methods: POST');
    
    header("Access-Control-Allow-Headers: X-Requested-With");
    
    if($_SERVER['REQUEST_METHOD']=="POST"){
        convert();
    }

    function convert(){

        $data = json_decode(file_get_contents('php://input'));
        $ch = curl_init();

        $content = $data->content;
        $field = "csv=$content";
        $url="http://localhost:3009/convert";
        $header="Content-Type: application/x-www-form-urlencoded";

        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_POSTFIELDS,$field);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array($header));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $server_output = curl_exec ($ch);
        
        curl_close($ch);
        
        echo $server_output;
    }

    
?>