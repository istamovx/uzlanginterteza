@echo off
rem O'zbek intertekstual tezaurusi — bir bosishda ishga tushirish.
rem Server 8000-portda ko'tariladi va brauzer ochiladi.

cd /d "%~dp0backend"
start "" http://127.0.0.1:8000
python -m uvicorn app.main:app --port 8000
