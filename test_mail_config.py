#!/usr/bin/env python
"""Test mail configuration from env file"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from config import Config

print(f"MAIL_SERVER: {Config.MAIL_SERVER}")
print(f"MAIL_PORT: {Config.MAIL_PORT}")
print(f"MAIL_USE_TLS: {Config.MAIL_USE_TLS}")
print(f"MAIL_USERNAME: {Config.MAIL_USERNAME}")
print(f"MAIL_PASSWORD: {'*' * 10 if Config.MAIL_PASSWORD else 'NOT SET'}")
print(f"MAIL_DEFAULT_SENDER: {Config.MAIL_DEFAULT_SENDER}")
