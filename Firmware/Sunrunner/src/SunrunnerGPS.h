/*
* SunrunnerGPS.h
* Purpose: Take in GPS serial data and format into sentences for publishing
*
* @author Lena Voytek
* @version 1.0 11/18/2019 
*/

#ifndef SUNRUNNERGPS_H
#define SUNRUNNERGPS_H
#include <TinyGPS++.h>
#include <SerialBufferRK.h>

class SunrunnerGPS
{
protected:
	SerialBuffer<4096> * gpsSerialPort;
	TinyGPSPlus GPS = TinyGPSPlus();
	TinyGPSCustom gFix = TinyGPSCustom(GPS, "GPGGA", 6);
	char gpsBuffer;
	char sentenceBuffer[256];

public:
	// Configure the GPS for a 9600 baud Serial input
	void begin()
	{
		Serial1.begin(9600);
		gpsSerialPort = new SerialBuffer<4096>(Serial1);
		gpsSerialPort->setup();
	}

	/// Get available GPS data from serial for parsing
	void readGPSData()
	{
		while(gpsSerialPort->available()) {
			this->gpsBuffer = gpsSerialPort->read();
			this->GPS.encode(gpsBuffer);
		}
	}

	// Get the current GPS time as a character array
	// returns: a JSON formatted time statement
	char * getGPSTime()
	{
		if(this->GPS.date.isValid() && this->GPS.time.isValid())
			snprintf(this->sentenceBuffer, sizeof(this->sentenceBuffer), "\"%u/%u/%u, %02u:%02u:%02u\"", this->GPS.date.month(), this->GPS.date.day(), this->GPS.date.year(), this->GPS.time.hour(), this->GPS.time.minute(), this->GPS.time.second());
		else
			snprintf(this->sentenceBuffer, sizeof(this->sentenceBuffer), "null");
		
		return this->sentenceBuffer;
	}

	// Check if number of available satellites has changed
	boolean satellitesChanged()
	{
		return this->GPS.satellites.isUpdated();
	}

	// Determine the number of connected satellites
	float getSatellites()
	{
		return this->GPS.satellites.value();
	}

	// Get a JSON formatted GPS location/time sentence
	char * getFormattedGPSSentence()
	{
		snprintf(this->sentenceBuffer, sizeof(this->sentenceBuffer), "{\"datetime\":\"%u/%u/%u, %02u:%02u:%02u\", \"latitude\":%f, \"longitude\":%f, \"altitude\":%f, \"fix\":%s, \"satellites\":%lu, \"hdop\":%f}",this->GPS.date.month(),  this->GPS.date.day(), this->GPS.date.year(), this->GPS.time.hour(), this->GPS.time.minute(), this->GPS.time.second(), this->GPS.location.lat(), this->GPS.location.lng(), this->GPS.altitude.meters(), this->gFix.value(), this->GPS.satellites.value(), this->GPS.hdop.value() / 100.0);
		return this->sentenceBuffer;
	}

    float getLatitude()
    {
        return this->GPS.location.lat();
    }

    float getLongitude()
    {
        return this->GPS.location.lng();
    }

	float getGPSSpeed()
	{
		return this->GPS.speed.mph();
	}
};


#endif