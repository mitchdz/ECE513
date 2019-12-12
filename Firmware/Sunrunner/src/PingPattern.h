class PingPattern: public LEDStatus
{
private:
    size_t colorIndex = 0;
    system_tick_t colorTicks;

    static const uint32_t colors[];
    static const size_t colorCount = 5;

public:
    explicit PingPattern(LEDPriority priority) :
        LEDStatus(LED_PATTERN_CUSTOM, priority),
        colorIndex(0),
        colorTicks(0) {
    }

protected:
    virtual void update(system_tick_t ticks) override 
    {
        // Change status color every 300 milliseconds
        colorTicks += ticks;
        if (colorTicks > 300)
        {
            if (++colorIndex == colorCount)
            {
                colorIndex = 0;
            }
            setColor(colors[colorIndex]);
            colorTicks = 0;
        }
    }
};

const uint32_t PingPattern::colors[] = {
    RGB_COLOR_MAGENTA,
    RGB_COLOR_BLUE,
    RGB_COLOR_CYAN,
    RGB_COLOR_GREEN,
    RGB_COLOR_YELLOW
};