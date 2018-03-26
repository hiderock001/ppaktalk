<template>
    <div id="app">
        <div class="form" v-if="uid==''">
            <div class="intro">
                <div class="intro-app" v-if="!intro">
                    <div class="logo-wrap"><h1 class="logo">빡톡</h1></div>
                    <div class="btn-wrap">
                        <button v-on:click="introCheck('login')">로그인하기</button>
                        <button v-on:click="introCheck('join')">가입하기</button>
                    </div>
                </div>
                <div class="form-input" v-if="intro">
                    <p>이메일</p>
                    <input type="text" v-model="email" />
                    <p>패스워드</p>
                    <input type="password" v-model="password" />
                    <div>
                        <button v-on:click="login" v-if="intLogin">로그인하기</button>
                        <button v-on:click="signUp" v-else>가입하기</button>
                        <button v-on:click="back">이전으로</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="chat" v-if="!uid==''">
            <div class="view">
                <div class="fix"><button v-on:click="logout">로그아웃</button></div>
                <div class="chat-view" id="chat-view">
                    <div class="chat-box" v-for="chatting in chat" v-bind:class="{my : (chatting.email == email)}">
                        <div class="msg" v-if="chatting.msg !== ''"><pre>{{chatting.msg}}</pre><span></span></div>
                        <div class="_file" v-if="chatting.imageData !== ''">
                            <img v-bind:src="chatting.imageData" />
                        </div>
                        <div class="meta"><em>{{chatting.datetime}}</em></div>
                    </div>
                </div>
                <div class="chat-input">
                    <textarea v-model="msg" v-on:keydown="inputHandler"  ref="textarea"></textarea>
                    <button v-on:click="submit">전송</button>
                    <div class="file">
                        <button class="file-btn" v-on:click="uploadFile" ></button>
                        <input type="file" multiple ref="fileInput" accept="image/*" v-on:change="onFile"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import firebase from "firebase"
import {chatRefs} from "./config/firebase"
import {storageRef} from "./config/firebase"
import "./assets/reset.css"

var date = new Date();
var dateInfo = "" 
var Month = (date.getMonth()+1);
var Hours = date.getHours();
var Minutes = date.getMinutes();
if(Month < 10){
    Month = "0" + (date.getMonth()+1)
}
if(Hours > 12){
    Hours = "오후 " + parseInt(Hours - 12)
}else{
    Hours = "오전 " + Hours
}
if(Minutes < 10){
    Minutes = "0" + date.getMinutes()
}
dateInfo = Month +'.'+date.getDate()+'. '+Hours+':'+Minutes;

function setScroll() {
    var target = document.getElementById("chat-view");
    target.scrollTop = target.scrollHeight - target.offsetHeight;
    window.offsetTop = target.scrollTop;
}

export default {
  name: 'App',
  data : function(){
      return {
          intro : false,
          intLogin : false,
          uid : "",
          email : "",
          password : "",
          chat : {},
          msg : "",
          imageData : ""
      }
  },
  firebase : {
      chat : chatRefs
  },
  created : function(){
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.uid = user.uid;
                this.email = user.email;
                chatRefs.on("child_added", d => {
                    Vue.nextTick(() => {
                        setScroll();
                    })
                })
            }else{
                this.uid = "";
            }
    })
  },
  methods : {
      introCheck : function(loot){
          this.intro = true;
          if(loot == "login" ){
              this.intLogin = true;
          }
      },
      back : function(){
          this.intro = false;
          this.intLogin = false;
      },
      signUp : function(){
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
            .then((user)=>{
                this.email ="";
                this.password = "";
            })
            .catch((error)=>{
                alert(error);
            });
            
      },
      login : function(){
            firebase.auth().signInWithEmailAndPassword(this.email,this.password)
            .then((user)=>{
                this.email ="";
                this.password = "";
            })
            .catch((error)=>{
                alert(error);
            });
      },
      logout : function(){
            firebase.auth().signOut();
            this.email ="";
            this.password = "";
      },
      inputHandler : function(e){
           if(e.keyCode === 13 && !e.shiftKey){
                e.preventDefault();
                this.submit();
            }
      },
      submit : function(e){
           // 글자 없을때 그리고 스페이스 엔터 추가해야함
            if(this.msg == ""){
                e.preventDefault()
            }
            chatRefs.push({
                msg : this.msg,
                datetime :dateInfo,
                uid : this.uid,
                email : this.email,
                imageData : ""
            });
            this.msg = "";      
      },
      uploadFile : function(){
          this.$refs.fileInput.click();
      },
      onFile : function(e){
            var selectedFile = e.target.files[0];
            var filename = selectedFile.name;
            var storageRef = firebase.storage().ref('/chat/'+filename);
            var uploadTask = storageRef.put(selectedFile);
            var that = this;
            uploadTask.on('state_changed',function(snapshot){
              
            },function(error){

            },function(){ 
                var downloadURL = uploadTask.snapshot.downloadURL;
                chatRefs.push({
                    msg : that.msg,
                    datetime :dateInfo,
                    uid : that.uid,
                    email : that.email,
                    imageData : downloadURL
                }); 
            });
      }
  }
}
</script>

<style>
html,body{height:100%;}
#app{height:100%;background:#b2c7d9;position:relative;}
.form{width:100%;height:100%;background:#fae814;}
.logo-wrap{text-align:center;width:100%;}
.logo-wrap .logo{display:inline-block;padding-top:20vh;width:250px;height:200px;background:url(./assets/logo.png) no-repeat center center;text-indent:-9999px;background-size:250px 200px;}
.intro{height:100%;}
.intro .btn-wrap{position:absolute;width:90%;left:50%;top:70%;text-align:center;transform:translate(-50%,-10%);}
.intro .btn-wrap button{display:block;width:100%;margin:10px auto;background:#3e1918;border:1px solid #756226;border-radius:6px;height:36px;box-sizing:border-box;text-align:center;color:#fff;font-size:13px;}
.intro-app{height:100%;position:relative;}
.form-input{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80%;}
.form-input p{margin:10px 0 5px;font-size:14px;color:#000;}
.form-input input{width:100%;height:32px;border:0;box-sizing:border-box;padding:0 10px;line-height:32px;color:#000;font-size:14px;font-weight:600;}
.form-input button{display:block;width:100%;margin:10px auto;background:#3e1918;border:1px solid #756226;border-radius:6px;height:36px;box-sizing:border-box;text-align:center;color:#fff;font-size:13px;}
.form-input > div{margin-top:20px;}
.chat{height:100%;}
.fix{width:100%;height:50px;background:#a9bdce;box-sizing:border-box;padding:0 11px;border-bottom:1px solid #a4b7c8;}
.fix:after{content:"";display:block;clear:both;}
.fix button{margin-top:14px;float:right;display:block;width:22px;height:17px;background:url(./assets/logout.png) no-repeat left center;background-size:22px 17px;text-indent:-9999px;}
.view{position:relative;width:100%;height:100%;}
.chat-view{height:calc(100% - 161px);overflow-y:auto;padding:10px 18px 0;}
.chat-box:after{content:"";display:block;clear:both;}
.chat-box{position:relative;margin-bottom:5px;}
.chat-box .msg{float:left;padding:8px;border-radius:6px;background:#fff;box-shadow:1px 1px #97a9b9;}
.chat-box .meta{float:left;padding:0 8px;display:block;min-height:100%;}
.chat-box .meta em{padding-top:6px;width:100%;display:inline-block;vertical-align:bottom;color:#000;font-size:11px;}
.chat-box span{position:absolute;top:5px;left:-7px;right:auto;width:7px;height:9px;background:url(./assets/chat-bg.jpg) no-repeat left center;}
.chat-box.my span{position:absolute;top:5px;left:auto;right:-7px;width:7px;height:9px;background:url(./assets/my-bg.jpg) no-repeat left center;}
.chat-box.my .msg{float:right;background:#ffeb33;}
.chat-box.my .meta{float:right;min-height:100%;}
.msg pre{color:#000;}
.chat-input{position:relative;height:100px;border-top:1px solid #f4f4f4;background:#fff;}
.chat-input:after{content:"";display:block;clear:both;}
.chat-input textarea{width:100%;height:70px;box-sizing:border-box;resize:none;border:none;background:#fff;padding:10px;color:#000;font-size:14px;}
.chat-input > button{position:absolute;right:12px;top:10px;width:48px;height:28px;box-sizing:border-box;border:1px solid #e8d73f;
background:#ffec42;line-height:28px;border-radius:5px;color:#000;}
.file{height:30px;width:100%;}
.file .file-btn{margin-left:20px;width:17px;height:17px;display:block;background:url(./assets/file.jpg) no-repeat left center;background-size:17px 17px;}
.file input[type='file']{display:none;}
._file img{display:inline-block;max-width:180px;border-radius:4px;}
.chat-box ._file{float:left;display:inline-block;border-radius:6px;}
.chat-box.my ._file{float:right;border-radius:6px;}
</style>
