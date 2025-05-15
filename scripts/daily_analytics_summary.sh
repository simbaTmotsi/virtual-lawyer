#!/bin/bash
# Scheduled task script to run the analytics summary generation command daily

# Change to the project directory
cd /Users/simbatmotsi/Documents/Projects/virtual-lawyer/backend

# Activate the virtual environment (adjust path as needed)
source ../.venv/bin/activate

# Run the management command
python manage.py generate_analytics_summary

# Capture the exit code
EXIT_CODE=$?

# Log the result
if [ $EXIT_CODE -eq 0 ]; then
    echo "$(date): Analytics summary generated successfully" >> /var/log/easylaw/analytics_summary.log
else
    echo "$(date): Error generating analytics summary (exit code: $EXIT_CODE)" >> /var/log/easylaw/analytics_summary.log
fi

exit $EXIT_CODE
