
<?php

	class  Main{

		//fetching posts from database
		public function posts($id){
			global $pdo;
			$query = $pdo->prepare("SELECT * FROM `posts`,`users`,`following` WHERE `user_name` = `user_id_p` and `users`.user_id=`following`.`follower_id` And `following`.user_id = $id    ORDER BY `status_time` DESC limit 5");
			$query->execute();
			return $query->fetchAll();
		}

		//fetch user data by user id
		public function user_data($user_id){
			global $pdo;
			$query = $pdo->prepare('SELECT * FROM users WHERE user_id = ?');
			$query->bindvalue(1,$user_id);
			$query->execute();

			return $query->fetch();
		}
		//timeAgo Function
		public function timeAgo($time_ago){

			$time_ago = strtotime($time_ago);
			$cur_time   = time();
			$time_elapsed   = $cur_time - $time_ago;
			$seconds    = $time_elapsed ;
			$minutes    = round($time_elapsed / 60 );
			$hours      = round($time_elapsed / 3600);
			$days       = round($time_elapsed / 86400 );
			$weeks      = round($time_elapsed / 604800);
			$months     = round($time_elapsed / 2600640 );
			$years      = round($time_elapsed / 31207680 );
			// Seconds
			if($seconds <= 60){
			    return "just now";
			}
			//Minutes
			else if($minutes <=60){
			    if($minutes==1){
			        return "one minute ago";
			    }
			    else{
			        return "$minutes minutes ago";
			    }
			}
			//Hours
			else if($hours <=24){
			    if($hours==1){
			        return "an hour ago";
			    }else{
			        return "$hours hrs ago";
			    }
			}
			//Days
			else if($days <= 7){
			    if($days==1){
			        return "yesterday";
			    }else{
			        return "$days days ago";
			    }
			}
			//Weeks
			else if($weeks <= 4.3){
			    if($weeks==1){
			        return "a week ago";
			    }else{
			        return "$weeks weeks ago";
			    }
			}
			//Months
			else if($months <=12){
			    if($months==1){
			        return "a month ago";
			    }else{
			        return "$months months ago";
			    }
			}
			//Years
			else{
			    if($years==1){
			        return "one year ago";
			    }else{
			        return "$years years ago";
			    }
			}
		}
		public function adposts(){
			global $pdo;
			$query = $pdo->prepare("SELECT * FROM `post_ad` ORDER BY `id` DESC");
			$query->execute();
			return $query->fetchAll();
		}
		public function bachelor($row1){
			global $pdo;
			$query = $pdo->prepare("SELECT * FROM `institutes` where course='$row1' ORDER BY `name` DESC ");
			$query->execute();
			return $query->fetchAll();
		}
		public function notespdf($row1){
			global $pdo;
			$query = $pdo->prepare("SELECT * FROM `notespdf` WHERE course = '$row1' ORDER BY `id` DESC ");
			$query->execute();
			return $query->fetchAll();
		}
		public function followerlist($id){
			global $pdo;
			$query = $pdo->prepare("SELECT `users`.user_id, `users`.`user_name`, `users`.`fname`, `users`.`sname`, `users`.`user_gender`, `users`.`user_dob`, `users`.`profile_image`, `users`.`image_text` FROM `users` LEFT JOIN `following` ON  `following`.`follower_id`=`users`.user_id And `following`.user_id = '$id' where `following`.`follower_id` IS NULL ORDER BY `users`.user_id desc LIMIT 3" );
			$query->execute();
			return $query->fetchAll();
		}
		public function followerlistall($id){
			global $pdo;
			$query = $pdo->prepare("SELECT `users`.user_id, `users`.`user_name`, `users`.`fname`, `users`.`sname`, `users`.`user_gender`, `users`.`user_dob`, `users`.`profile_image`, `users`.`image_text` FROM `users` LEFT JOIN `following` ON  `following`.`follower_id`=`users`.user_id And `following`.user_id = '$id' where `following`.`follower_id` IS NULL " );
			$query->execute();
			return $query->fetchAll();
		}

	  public function followerCount($id){
				global $pdo;
				$query = $pdo->prepare("SELECT COUNT(follower_id) as total FROM following where user_id=$id" );
				$query->execute();
				return $query->fetch();
			}
			public function followingCount($id){
					global $pdo;
					$query = $pdo->prepare("SELECT COUNT(follower_id) as total FROM following where follower_id=$id" );
					$query->execute();
					return $query->fetch();
				}
				public function postsCount($user_id){
						global $pdo;
						$query = $pdo->prepare("SELECT COUNT(post_id) as total FROM posts where user_id_p = $user_id" );
						$query->execute();
						return $query->fetch();
					}
		public function userprofile($username1){
			global $pdo;
			$query = $pdo->prepare("SELECT * FROM `users` where user_name='$username1' ");
			$query->execute();
			return $query->fetchAll();
		}
		public function commentShow($post_id){
			global $pdo;
			$query = $pdo->prepare("SELECT * FROM users A LEFT JOIN comment B ON A.user_id = B.user_id WHERE B.post_id=$post_id");
			$query-> execute();
			return $query->fetchAll();
		}
			public function userposts($username1){
			global $pdo;
			$query = $pdo->prepare("SELECT * FROM `posts`, `users` WHERE  user_name=user_id_p AND user_id_p = '$username1'  ORDER BY `post_id` DESC limit 5");
			$query->execute();
			return $query->fetchAll();
		}


	}
?>
