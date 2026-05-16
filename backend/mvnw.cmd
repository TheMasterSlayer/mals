@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET @@MVNW_APP_DIR=%~dp0
@IF "%@@MVNW_APP_DIR:~-1%"=="\" (SET @@MVNW_APP_DIR=%@@MVNW_APP_DIR:~0,-1%)
@SET MAVEN_WRAPPER_JAR="%@@MVNW_APP_DIR%\.mvn\wrapper\maven-wrapper.jar"
@SET MAVEN_WRAPPER_PROPERTIES="%@@MVNW_APP_DIR%\.mvn\wrapper\maven-wrapper.properties"

@IF NOT EXIST %MAVEN_WRAPPER_JAR% (
  @ECHO Downloading Maven Wrapper...
  @powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $wrapperUrl=(Get-Content -raw '%MAVEN_WRAPPER_PROPERTIES%' | Select-String -Pattern 'wrapperUrl=(.+)').Matches[0].Groups[1].Value.Trim(); Invoke-WebRequest -Uri $wrapperUrl -OutFile '%MAVEN_WRAPPER_JAR%'}"
)

@SET JAVA_HOME_CMD=java
%JAVA_HOME_CMD% -jar %MAVEN_WRAPPER_JAR% %*
