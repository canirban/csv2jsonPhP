<?php
    header('Access-Control-Allow-Origin: *');

    header('Access-Control-Allow-Methods: POST');
    
    header("Access-Control-Allow-Headers: X-Requested-With");

        if($_SERVER['REQUEST_METHOD']=="POST"){
         convert();
        }else{
            header('HTTP/1.0 404 Not Found');
            echo "<h1>404 Not Found</h1> 
            The page that you have requested could not be found.";
            exit();
        }

    function convert(){

        $data = json_decode(file_get_contents('php://input'));
        $curl = curl_init();

        $content = $data->content;
        $field = "csv=$content";
        $url="http://localhost:3009/convert";
        $header="Content-Type: application/x-www-form-urlencoded";

        curl_setopt($curl, CURLOPT_URL,$url);
        curl_setopt($curl, CURLOPT_POSTFIELDS,$field);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array($header));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        $server_output = curl_exec ($curl);
        
        curl_close($curl);
        
        echo $server_output;
    }
    
?>