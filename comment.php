<?php
session_start();
if(isset($_SESSION["user_name"])){
include './post.php';
$user_id= $_SESSION["user_id"];
$post_id=$_POST['id'];

$commentShow= $get->commentShow($post_id);

?>
<!DOCTYPE html>
<html lang="en-us">
<head>
  <meta charset="UTF-8">
  <title>comment</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

</script>
<style>
.imgboxx {


   	float:left;
	  border-radius: 1000px;
    overflow: hidden;
    width: 40px;
    height:40px;
    border: 1px solid blue;
    margin-left:15px;
    margin-top:5px;

}
.imgboxx img {

	  float:left;
	  border-radius:1000px;
    overflow: hidden;
    width: 40px;
    height:40px;
}
</style>
  </head>
  <body >

<div class="inputcomment" onload="prettyPrint()">

<form action="commentdb.php?post_id=<?php echo $post_id;?>" enctype="multipart/form-data" method="post">
  <input name="comment" style="color:grey; height:50px; border:1px solid grey; border-radius:10px; width:100%; text-align: left; padding-left: 20px; display:block;" placeholder="Comment Here..." />
  <button name="commentbutton" class="comm" style="float:right; margin-top:-25px; background-color: #00b5ff; color:white; "> Comment</button>
</form><br>
<?php
foreach($commentShow as $roww)

{
echo
'<div class="commentbox"  style=" border-radius:10px; border:1px solid lightblue; width:95%; height:auto;">
<div class="imgboxx" ><img src="profile_image/'.$roww['profile_image'].'"></img></div>
<div style="display:inline-block; margin-top:15px; float:left;"><span style="color:#1d71f7; margin-left:15px;"><a href="userprofile.php? username='.$roww['user_name'].'">'.$roww['fname'].' '.$roww['sname']. '</a> <small style="color:#c9cfd8;">from '.$roww['user_dob']. '</small> </span> <span style="color:#c9cfd8;"><small>'.$get->timeAgo($roww['comment_time']).'</small></span></div>
<br><br><hr style="margin-top:9px; color:blue; width:100%;"><div style="text-aling:left; color:#7f8184;"><p>'.$roww['content'].'</p></div>

</div><br>';
}
?>
</div>

</body>
</html>
<?php

}else { header("Location:index.php");
}
?>
