#!/bin/bash
cd ~/vitaleevo
gh pr checks 6 2>&1 | grep -E "fail" | head -5
