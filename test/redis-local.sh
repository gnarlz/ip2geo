DOCKER_NAME="ip2geo-redis"

if [ ! -z $CI_JOB_ID ]  ; then
    export NMIPS_USE_REDIS=1
    echo "Using RedisMock"
else
    if [ $(docker ps -all -q -f "name=${DOCKER_NAME}" $1 | wc -l) -eq 0 ] ; then
      echo "Creating docker container with redis"
      docker run -d --name ${DOCKER_NAME}  -p 6379:6379 redis:latest redis-server --appendonly yes
      sleep 1
    elif [ $(docker ps -q -f "name=${DOCKER_NAME}" $1 | wc -l) -eq 0 ] ; then
      echo "Restarting docker container with redis"
      docker start ${DOCKER_NAME} >/dev/null
      sleep 1
    else
      echo "Docker container with redis already running"
    fi
    echo "Docker container with redis is ready for use"
fi
