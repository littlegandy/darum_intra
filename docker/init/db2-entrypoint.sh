#!/bin/bash
# fencedid 파일을 삭제하여 db2icrt가 올바른 GID로 재생성하도록 함
FENCEDID=/database/config/db2inst1/sqllib/adm/fencedid
if [ -f "$FENCEDID" ]; then
    rm -f "$FENCEDID"
fi

exec /var/db2_setup/lib/setup_db2_instance.sh "$@"
