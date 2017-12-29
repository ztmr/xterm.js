#!/bin/sh

export XTERM_ENTRYPOINT=/opt/gtmis/bin/tied
cd /data/xterm
nohup node demo/app &
