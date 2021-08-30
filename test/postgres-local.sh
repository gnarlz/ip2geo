DOCKER_NAME="ip2geo-postgres"

if [ ! -z $CI_JOB_ID ]  ; then
    export NMIPS_USE_POSTGRES=1
    echo "Using PostgresMock"
else
    if [ $(docker ps -all -q -f "name=${DOCKER_NAME}" $1 | wc -l) -eq 0 ] ; then
      echo "Creating docker container with postgres"
      rm -rf ${HOME}/postgres-data/
      mkdir ${HOME}/postgres-data/
      docker run -d 	--name ${DOCKER_NAME} -e POSTGRES_USER=ip2geo -e POSTGRES_PASSWORD=kzsu666  -v ${HOME}/postgres-data/:/var/lib/postgresql/data  -p 5432:5432 postgres
      sleep 1
    elif [ $(docker ps -q -f "name=${DOCKER_NAME}" $1 | wc -l) -eq 0 ] ; then
      echo "Restarting docker container with postgres"
      docker start ${DOCKER_NAME} >/dev/null
      sleep 1
    else
      echo "Docker container with postgres already running"
    fi
    echo "Docker container with postgres is ready for use"
fi
