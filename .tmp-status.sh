#!/bin/bash
cd ~/vitaleevo
git status --short | grep -vE "public|\.tmp" | head -40
