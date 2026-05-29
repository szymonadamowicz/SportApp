FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY apiModule/ApiModule/WebApplication1/ ./
RUN dotnet restore "ApiModule.csproj"
RUN dotnet publish "ApiModule.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV FormAnalysis__PythonExecutable=/opt/form-analysis/bin/python
EXPOSE 8080

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        libgomp1 \
        ffmpeg \
        python3 \
        python3-venv \
    && rm -rf /var/lib/apt/lists/*

COPY videoAnalysysModule/requirements.txt /tmp/form-analysis-requirements.txt
RUN python3 -m venv /opt/form-analysis \
    && /opt/form-analysis/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/form-analysis/bin/pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch torchvision \
    && /opt/form-analysis/bin/pip install --no-cache-dir -r /tmp/form-analysis-requirements.txt \
    && /opt/form-analysis/bin/pip uninstall -y opencv-python \
    && /opt/form-analysis/bin/pip install --no-cache-dir --force-reinstall 'opencv-python-headless>=4.9,<5'

COPY --from=build /app/publish .
COPY videoAnalysysModule ./videoAnalysysModule
RUN /opt/form-analysis/bin/python videoAnalysysModule/download_models.py --models yolov8s-pose
ENV YOLO_CONFIG_DIR=/tmp
ENTRYPOINT ["dotnet", "ApiModule.dll"]
