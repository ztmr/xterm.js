#!/bin/sh

if [ `id -un` != "idea" ] ; then
  echo "Must be run as 'idea' user!"
  exit 1;
fi

export XTERM_ENTRYPOINT=/opt/gtmis/bin/tied
cd /data/xterm
nohup node demo/app &
