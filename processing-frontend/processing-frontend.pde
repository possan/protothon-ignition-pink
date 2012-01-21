import java.net.*;
import processing.video.*;
import org.json.*;

Capture myCapture;
float[] lastframe;
int capframe = 0;
float score1 = 0;
float score2 = 0;
int camwidth = 160;
int camheight = 120;
// PFont font = loadFont("FFScala-32.vlw");

String curartist = ""; 
String curtrack = ""; 
String artist1 = "";
String track1 = "";
String artist2 = ""; 
String track2 = ""; 
String uimode = "init";

class SimpleThread extends Thread {
  
  int wait;
  boolean running;
  int count;
  
   // Overriding "start()"
  void start () {
    // Set running equal to true
    count = 0;
    wait = 600;
    running = true;
    // Print messages
    println("Starting thread (will execute every " + wait + " milliseconds.)"); 
    // Do whatever start does in Thread, don't forget this!
    super.start();
  }
 
   void handleEventJson(String json) {  
      try {
        if( !json.equals( "{}")  ){
          println("got event json: "+json);
          
          JSONObject data = new JSONObject(json);
          println("got event: "+data);
           
           JSONObject eventdata = data.getJSONObject( "event" );
           println(eventdata);
           
           String eventtype = eventdata.getString("type" );
          println(eventtype);
          
          if( eventtype.equals( "bad" ) ) {
            uimode = "bad";
          }
          if( eventtype.equals( "start" ) ) {
            uimode = "start";
          }
          if( eventtype.equals( "challenge" ) ) {
            uimode = "challenge";
          }
          if( eventtype.equals( "set-options" ) ) {
          
              artist1 = eventdata.getString( "artist1" );
              track1 = eventdata.getString( "track1" );
              artist2 = eventdata.getString( "artist2" ); 
              track2 = eventdata.getString( "track2" ); 
              
              println( "artist1="+artist1 );
              println( "track1="+track1 );
              println( "artist2="+artist2 );
              println( "track2="+track2 );
          }
          if( eventtype.equals( "set-playing" ) || eventtype.equals( "start" )  ) {
          
              curartist = eventdata.getString( "artist" );
              curtrack = eventdata.getString( "track" );
              
              println( "curartist="+curartist );
              println( "curtrack="+curtrack );
          }
        }
      } catch (Exception e) {
      }
  }
 
   // We must implement run, this gets triggered by start()
  void run () {
    handleEventJson("{ \"event\" : {\"type\":\"test\" } }");
    while (running) {
      
      try {
        String u = "http://127.0.0.1:1337/reportscore?a="+score1+"&b="+score2;
      println("Sending update: " +u);
        String[]  s = loadStrings( u );
        println("s="+s[0]);
      } catch (Exception e) {
      }
      
      try {
        String u = "http://127.0.0.1:1337/polldisplay";
        println("Sending update: " +u);
        String  s = loadStrings( u )[0];
        handleEventJson(s);
      } catch (Exception e) {
      }

      count++;
      // Ok, let's wait for however long we should wait
      try {
        sleep((long)(wait));
      } catch (Exception e) {
      }
    }
  }
}

void setup() 
{
//  if( width < 300 || height < 300 )
      size(1280, 800);
    
  lastframe = new float[camwidth*camheight];
  println(Capture.list());
  myCapture = new Capture(this, camwidth, camheight, 30);
  SimpleThread thread1 = new SimpleThread();
  thread1.start();
}

float l = 0;
float m = 0;

float l2 = 0;
float m2 = 0;


void captureEvent(Capture myCapture) {
  myCapture.read();
  myCapture.loadPixels();

  m = 0;
  m2 = 0;
  
//  myCapture.pixels[1] = 0xFF000000 | (int)(100000 * Math.random());

  for( int j=0; j<camheight; j++ ) {
    for( int i=0; i<camwidth/2; i++ ) {
      int o = j * camwidth + (i);
      int o2 = j * camwidth + ((camwidth-1)-i);
      int a = myCapture.pixels[o];
      int b = myCapture.pixels[o2];
      myCapture.pixels[o] = b;
      myCapture.pixels[o2] = a;
    }
  }
  
  for( int j=0; j<camheight; j++ ) {
    for( int i=0; i<camwidth; i++ ) {
      int o = j * camwidth + i;
      float r1 = (red( myCapture.pixels[o] )
            + green( myCapture.pixels[o] )
          + blue( myCapture.pixels[o] ))/3;
      
      float d = r1 - lastframe[o];
      Boolean left = i < (camwidth/2); 
      if( capframe > 5 ) {
        if( left ) 
          m += d; 
        else 
          m2 += d;
      }
      lastframe[o] = r1;
        int shad = 64 + (int)(r1/2); 
      if( left ) {
        myCapture.pixels[o] = 0xFF004040 | (shad << 16);
      } else {
        myCapture.pixels[o] = 0xFF400040 | (shad << 8);
      }
    }
  } 
  
  m *= 100;
  m2 *= 100;
  
  m /= (camwidth*camheight/4);
  m2 /= (camwidth*camheight/4);
  
  capframe ++;
}

String URLEncode(String string){
 String output = new String();
 try{
   byte[] input = string.getBytes("UTF-8");
   for(int i=0; i<input.length; i++){
     if(input[i]<0)
       output += '%' + hex(input[i]);
     else if(input[i]==32)
       output += '+';
     else
       output += char(input[i]);
   }
 }
 catch(UnsupportedEncodingException e){
   e.printStackTrace();
 }

 return output;
}

void keyPressed() {
  print(keyCode);
//  if( keyCode == 'F' ){
//  fullscreen();
//  }
  if( keyCode == 32 || keyCode == 10 ) {
    // skip
          
      try {
        String e = "{\"type\":\"skip\"}";
        String u = "http://127.0.0.1:1337/postspotify?event="+URLEncoder.encode(e);
        println("Posting event: " +u);
        String[]  s = loadStrings( u );
        println("s="+s[0]);
      } catch (Exception e) {
      }
      

  }
}

void draw() {
  
  noStroke();
  image(myCapture, 0, 0, width, height);

  l *= 0.7;
  l2 *= 0.7;

  l += 0.3 * abs( m );
  l2 += 0.3 * abs( m2 );
  
  score1 *= 0.99;
  score2 *= 0.99;
  
  score1 += 0.01 * (l - 50);
  score2 += 0.01 * (l2 - 50);

  if( score1 < 0 )
      score1 = 0;
  if( score2 < 0 )
      score2 = 0;

  float r = l / 10;
  float r2 = l2 / 10;
  
  if( r>100 ) r=100;
  if( r2>100 ) r2=100;

  //  textFont(font); 

  int h1 = 5 + (int)(height * score1 / 100);
  int h2 = 5 + (int)(height * score2 / 100); 
  
  int bw = width/10;
  
  
  fill(255, 102, 153);
  
    
//  ellipse(width*1/4,height/2,r,r);
  rect( width*1/4-bw/2, height, bw, -h1 );
  
//  text("m="+m, (width*0/4)+30, height-35); 
//  text("l="+l, (width*0/4)+30, height-20); 
  
//  if( uimode.equals( "challenge" ) ) {
//    text(track1, (width*1/4), 35); 
 //   text(artist1, (width*1/4), 45); 
 // }

  fill(40, 192, 20);
//  ellipse(width*3/4,height/2,r2,r2);
//  text("m2="+m2, (width*2/4)+30, height-35);
//  text("l2="+l2, (width*2/4)+30, height-20);
  rect( width*3/4-bw/2, height, bw, -h2 );
//  text("score2="+(int)score2, (width*2/4)+30, 15); 
  
//  if( uimode.equals( "challenge" ) ){
 //   text(track2, (width*3/4), 35); 
 //   text(artist2, (width*3/4), 45); 
//  }



  fill(255, 255, 255);
  textAlign(CENTER);
  
  text((int)score1, (width*1/4), 70); 
  text((int)score2, (width*3/4), 70); 
  
  text(track1, (width*1/4), 30); 
  text(artist1, (width*1/4), 50); 
  
  text(track2, (width*3/4), 30); 
  text(artist2, (width*3/4), 50);

  text(curtrack, (width*2/4), height/2-10); 
  text(curartist, (width*2/4), height/2+10);
}





