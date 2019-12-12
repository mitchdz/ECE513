/******************************************************/
//       THIS IS A GENERATED FILE - DO NOT EDIT       //
/******************************************************/

#line 1 "/home/lena/Dropbox/UA/ECE_513/Group-ECE513/Firmware/Sunrunner/src/Sunrunner.ino"
#include "Particle.h"
#include "dct.h"
#include "SunrunnerGPS.h"
#include "SunrunnerUV.h"
#include "PingPattern.h"

int ping(String command);
int publishData(String command);
void setup();
void loop();
#line 7 "/home/lena/Dropbox/UA/ECE_513/Group-ECE513/Firmware/Sunrunner/src/Sunrunner.ino"
SYSTEM_THREAD(ENABLED);

SunrunnerGPS gps;
SunrunnerUV uv;

char dataBuffer[512];

char apiKey[] = "xkph53MtYADVQ98Ry78MEsqXGmH0BYru";

PingPattern pingRGB = PingPattern(LED_PRIORITY_IMPORTANT);
unsigned long pingTimer = 0;
boolean activePing = false;

int ping(String command)
{
	pingRGB.setActive();
	publishData(" ");

	pingTimer = millis();
	activePing = true;

	return 0;
}

//Numeric return reference:
//  0: success
//  1: No GPS
//  2: No UV
//  3: No GPS or UV
int publishData(String command)
{
	if(gps.getSatellites() > 0) 
	{
		
		if(uv.isAvailable())
		{
			snprintf(dataBuffer, 512, "{\"time\":%s, \"gps_exists\":true, \"gps_lat\":%f, \"gps_long\":%f, \"gps_speed\":%f, \"uv\":%f, \"deviceId\": \"%s\", \"APIkey\":\"%s\"}", 
				gps.getGPSTime(), gps.getLatitude(), gps.getLongitude(), gps.getGPSSpeed(), uv.getUVIndex(), System.deviceID().c_str(), apiKey);

			Particle.publish("sunrunner", dataBuffer, PRIVATE);

			return 0;
		}
		else
		{
			snprintf(dataBuffer, 512, "{\"time\":%s, \"gps_exists\":true, \"gps_lat\":%f, \"gps_long\":%f, \"gps_speed\":%f, \"uv\":-1, \"deviceId\":\"%s\", \"APIkey\":\"%s\"}", 
				gps.getGPSTime(), gps.getLatitude(), gps.getLongitude(), gps.getGPSSpeed(), System.deviceID().c_str(), apiKey);
			
			Particle.publish("sunrunner", dataBuffer, PRIVATE);

			return 2;	
		}
	}
	else
	{
		if(uv.isAvailable())
		{
			snprintf(dataBuffer, 512, "{\"time\":null, \"gps_exists\":false, \"gps_lat\":0, \"gps_long\":0, \"gps_speed\":0, \"uv\":%f, \"deviceId\": \"%s\", \"APIkey\":\"%s\"}", 
				uv.getUVIndex(), System.deviceID().c_str(), apiKey);

			Particle.publish("sunrunner", dataBuffer, PRIVATE);

			return 1;
		}
		else
		{
			snprintf(dataBuffer, 512, "{\"time\":null, \"gps_exists\":false, \"gps_lat\":0, \"gps_long\":0, \"gps_speed\":0, \"uv\":-1, \"deviceId\": \"%s\", \"APIkey\":\"%s\"}", 
				System.deviceID().c_str(), apiKey);

			Particle.publish("sunrunner", dataBuffer, PRIVATE);
			
			return 3;	
		}
	}
}


void setup()
{
	gps.begin();
	uv.begin();

	Particle.function("getdata", publishData);
	Particle.function("pingDevice", ping);

	delay(1000);

	Particle.connect();
}

void loop()
{
	gps.readGPSData();
	uv.readValues();

	if(activePing)
	{
		if(millis() - pingTimer > 5000)
		{
			activePing = false;
			pingRGB.setActive(false);
		}
	}

	delay(500);
}