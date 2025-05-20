@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: ANSI renk kodları için gerekli ayar
reg add HKEY_CURRENT_USER\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f > nul 2>&1

:: Emojiler
set "OK=✅"
set "HATA=❌"
set "BILGI=ℹ️"
set "BRANCH=🌿"
set "PUSH=⬆️"
set "PULL=⬇️"
set "MENU=📋"
set "STASH=📦"
set "MERGE=🔄"
set "DELETE=🗑️"
set "STATUS=📊"

:menu
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║ 📋 GIT İŞLEMLERİ MENÜSÜ                                   ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║ 1. 🌿 Mevcut Branch'e Push Yap                            ║
echo ║ 2. 🌿 Yeni Branch Oluştur ve Push Yap                     ║
echo ║ 3. ⬇️ Pull İşlemi Yap                                     ║
echo ║ 4. ℹ️ Mevcut Branch'i Göster                              ║
echo ║ 5. ℹ️ Tüm Branch'leri Listele                             ║
echo ║ 6. 📊 Değişiklikleri Göster                               ║
echo ║ 7. 📦 Stash İşlemleri                                     ║
echo ║ 8. 🔄 Merge İşlemi Yap                                    ║
echo ║ 9. 🗑️ Branch Sil                                          ║
echo ║ 0. ❌ Çıkış                                               ║
echo ╚════════════════════════════════════════════════════════════╝

set /p secim="Seçiminiz (0-9): "

if "%secim%"=="1" goto mevcut_branch_push
if "%secim%"=="2" goto yeni_branch_push
if "%secim%"=="3" goto pull_yap
if "%secim%"=="4" goto branch_goster
if "%secim%"=="5" goto branch_listele
if "%secim%"=="6" goto degisiklikleri_goster
if "%secim%"=="7" goto stash_menu
if "%secim%"=="8" goto merge_yap
if "%secim%"=="9" goto branch_sil
if "%secim%"=="0" goto cikis

echo ❌ Geçersiz seçim! Lütfen 0-9 arası bir sayı girin.
timeout /t 2 > nul
goto menu

:mevcut_branch_push
echo ℹ️ Mevcut branch'e push yapılıyor...
git add .
set /p commit_msg="📝 Commit mesajını giriniz: "
git commit -m "%commit_msg%"
git push
if %errorlevel% neq 0 (
    echo ❌ Push işlemi başarısız oldu!
) else (
    echo ✅ Push işlemi başarılı!
)
pause
goto menu

:yeni_branch_push
set /p branch_name="🌿 Yeni branch adını giriniz: "
echo ℹ️ %branch_name% branch'ine geçiş yapılıyor...
git checkout -b %branch_name%
if %errorlevel% neq 0 (
    echo ❌ Branch oluşturma başarısız oldu!
    pause
    goto menu
)
git add .
set /p commit_msg="📝 İlk commit mesajını giriniz: "
git commit -m "%commit_msg%"
git push -u origin %branch_name%
if %errorlevel% neq 0 (
    echo ❌ Push işlemi başarısız oldu!
) else (
    echo ✅ Branch oluşturma ve push işlemi başarılı!
)
pause
goto menu

:pull_yap
echo ⬇️ Pull işlemi yapılıyor...
git pull
if %errorlevel% neq 0 (
    echo ❌ Pull işlemi başarısız oldu!
) else (
    echo ✅ Pull işlemi başarılı!
)
pause
goto menu

:branch_goster
echo ℹ️ Mevcut branch bilgisi:
git branch --show-current
pause
goto menu

:branch_listele
echo ℹ️ Tüm branch'ler listeleniyor:
git branch -a
pause
goto menu

:degisiklikleri_goster
echo 📊 Değişiklikler gösteriliyor...
git status
echo.
echo 📊 Detaylı değişiklikler:
git diff
pause
goto menu

:stash_menu
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║ 📦 STASH İŞLEMLERİ                                        ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║ 1. 📦 Değişiklikleri Stash'le                             ║
echo ║ 2. 📦 Stash Listesini Göster                              ║
echo ║ 3. 📦 Son Stash'i Uygula                                  ║
echo ║ 4. 📦 Stash'i Sil                                         ║
echo ║ 5. ↩️ Ana Menüye Dön                                      ║
echo ╚════════════════════════════════════════════════════════════╝

set /p stash_secim="Seçiminiz (1-5): "

if "%stash_secim%"=="1" (
    set /p stash_msg="📝 Stash mesajını giriniz: "
    git stash save "%stash_msg%"
    if !errorlevel! neq 0 (
        echo ❌ Stash işlemi başarısız oldu!
    ) else (
        echo ✅ Değişiklikler stash'lendi!
    )
    pause
    goto stash_menu
)
if "%stash_secim%"=="2" (
    git stash list
    pause
    goto stash_menu
)
if "%stash_secim%"=="3" (
    git stash apply
    if !errorlevel! neq 0 (
        echo ❌ Stash uygulama başarısız oldu!
    ) else (
        echo ✅ Stash başarıyla uygulandı!
    )
    pause
    goto stash_menu
)
if "%stash_secim%"=="4" (
    git stash list
    set /p stash_index="Silinecek stash numarasını giriniz (örn: stash@{0}): "
    git stash drop %stash_index%
    if !errorlevel! neq 0 (
        echo ❌ Stash silme başarısız oldu!
    ) else (
        echo ✅ Stash başarıyla silindi!
    )
    pause
    goto stash_menu
)
if "%stash_secim%"=="5" goto menu
goto stash_menu

:merge_yap
echo 🔄 Merge işlemi yapılacak branch'i seçin:
git branch -a
echo.
set /p merge_branch="🌿 Merge edilecek branch adını giriniz: "
git merge %merge_branch%
if !errorlevel! neq 0 (
    echo ❌ Merge işlemi başarısız oldu!
    echo ℹ️ Çakışmaları manuel olarak çözmeniz gerekebilir.
) else (
    echo ✅ Merge işlemi başarılı!
)
pause
goto menu

:branch_sil
echo 🗑️ Silinecek branch'i seçin:
git branch -a
echo.
set /p silinecek_branch="🗑️ Silinecek branch adını giriniz: "
echo ℹ️ %silinecek_branch% branch'i siliniyor...
git branch -d %silinecek_branch%
if !errorlevel! neq 0 (
    echo ❌ Yerel branch silme başarısız oldu!
) else (
    echo ✅ Yerel branch silindi!
)
set /p remote_sil="Remote'dan da silmek istiyor musunuz? (E/H): "
if /i "%remote_sil%"=="E" (
    git push origin --delete %silinecek_branch%
    if !errorlevel! neq 0 (
        echo ❌ Remote branch silme başarısız oldu!
    ) else (
        echo ✅ Remote branch silindi!
    )
)
pause
goto menu

:cikis
echo ✅ İyi çalışmalar!
timeout /t 2 > nul
exit /b 0 