<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Define paths relative to the current index.php
$basePath = realpath(__DIR__);
$vendorPath = $basePath . '/../vendor';
$autoloadPath = $basePath . '/../vendor/autoload.php';
$envPath = $basePath . '/../.env';
$envExamplePath = $basePath . '/../.env.example';
$maintenancePath = $basePath . '/../storage/framework/maintenance.php';
$nextjsDir = realpath(__DIR__) . '/../frontend';

// Session management for installer steps
session_start();

if (isset($_SESSION['installation_complete']) && $_SESSION['installation_complete'] === true) {
    if (isset($_POST['clear_session'])) {
        session_destroy();
        header("Location: /");
        exit;
    }
}
// Check if Laravel is ready to boot normally
$canBootLaravel = file_exists($autoloadPath) &&
    file_exists($envPath) &&
    is_dir($vendorPath);

// If Laravel can boot normally, check if installation is complete
if ($canBootLaravel) {
    if (file_exists($envPath)) {
        $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($envLines as $line) {
            if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value, '"\'');
                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $value;
                    putenv("{$key}={$value}");
                }
            }
        }
    }

    $appKeySet = !empty($_ENV['APP_KEY'] ?? '');
    $dbConfigured = !empty($_ENV['DB_DATABASE'] ?? '') && !empty($_ENV['DB_USERNAME'] ?? '');

    $installationComplete = false;
    if ($appKeySet && $dbConfigured) {
        try {
            $dbConfig = [
                'connection' => $_ENV['DB_CONNECTION'] ?? 'mysql',
                'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
                'port' => $_ENV['DB_PORT'] ?? '3306',
                'database' => $_ENV['DB_DATABASE'],
                'username' => $_ENV['DB_USERNAME'],
                'password' => $_ENV['DB_PASSWORD'] ?? ''
            ];

            $dsn = "{$dbConfig['connection']}:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
            $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5
            ]);

            $result = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount() > 0;
            if ($result) {
                $installationComplete = true;
            }
        } catch (\Exception $e) {
            // Continue with installer
        }
    }

    if ($installationComplete) {
        if (file_exists($maintenancePath)) {
            require $maintenancePath;
        }
        require $autoloadPath;
        $app = require_once __DIR__ . '/../bootstrap/app.php';
        $app->handleRequest(Request::capture());
        exit;
    }
}

// Initialize session variables
if (!isset($_SESSION['installer_step'])) {
    $_SESSION['installer_step'] = 1;
}

$installer_message = '';
$installer_status = 'info';
$log_output = [];

/**
 * Helper function to run a shell command and capture output.
 */
function runShellCommand($command, $context)
{
    global $log_output;
    $log_output[] = ['message' => "Executing {$context}: `{$command}`", 'status' => 'running'];

    $projectRoot = realpath(__DIR__ . '/..');
    if (!is_dir($projectRoot . '/vendor') && is_dir(__DIR__ . '/vendor')) {
        $projectRoot = realpath(__DIR__);
    }

    $originalDir = getcwd();
    chdir($projectRoot);

    $descriptorspec = [
        0 => ["pipe", "r"],
        1 => ["pipe", "w"],
        2 => ["pipe", "w"]
    ];

    $process = proc_open($command, $descriptorspec, $pipes);

    if (is_resource($process)) {
        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $output = trim($stdout . "\n" . $stderr);
    } else {
        $status = 1;
        $output = "Failed to execute command";
    }

    chdir($originalDir);

    if (
        $status !== 0 ||
        str_contains($output, 'PHP Fatal error') ||
        str_contains($output, 'Uncaught Exception') ||
        str_contains($output, 'RuntimeException: Composer detected issues') ||
        str_contains($output, 'Failed to download')
    ) {
        $log_output[] = ['message' => "{$context} failed!", 'status' => 'error'];
        $log_output[] = ['message' => $output, 'status' => 'error'];
        return ['success' => false, 'output' => $output];
    } else {
        $log_output[] = ['message' => "{$context} completed successfully.", 'status' => 'success'];
        if (!empty($output)) {
            $log_output[] = ['message' => $output, 'status' => 'info'];
        }
        return ['success' => true, 'output' => $output];
    }
}

/**
 * Check all system requirements
 */
function checkSystemRequirements()
{
    $requirements = [
        'php_version' => ['status' => false, 'message' => '', 'required' => true, 'fix' => ''],
        'php_extensions' => ['status' => false, 'message' => '', 'required' => true, 'fix' => ''],
        'composer_version' => ['status' => false, 'message' => '', 'required' => true, 'fix' => ''],
        'storage_permissions' => ['status' => false, 'message' => '', 'required' => true, 'fix' => ''],
        'bootstrap_permissions' => ['status' => false, 'message' => '', 'required' => true, 'fix' => '']
    ];

    // Check PHP version (>= 8.3)
    $phpVersion = PHP_VERSION;
    // Detect the PHP CLI version used by Composer
    $cliPhpVersion = null;

    if (true) {
        $cliPhpVersionOutput = shell_exec("composer -r \"echo PHP_VERSION;\" 2>/dev/null");
        if (!empty($cliPhpVersionOutput)) {
            $cliPhpVersion = trim($cliPhpVersionOutput);
        }
    }

    if ($cliPhpVersion) {
        if (version_compare($cliPhpVersion, '8.3.0', '>=')) {
            $requirements['php_version']['status'] = true;
            $requirements['php_version']['message'] = "PHP (CLI) {$cliPhpVersion} ✓";
        } else {
            $requirements['php_version']['status'] = false;
            $requirements['php_version']['message'] = "PHP (CLI) {$cliPhpVersion} (Required: >= 8.3.0)";
            $requirements['php_version']['fix'] = "Update your PHP CLI to >= 8.3 (e.g., sudo apt-get install php8.3-cli)";
        }
    } else {
        // Fallback: check web PHP if CLI not available
        if (version_compare(PHP_VERSION, '8.3.0', '>=')) {
            $requirements['php_version']['status'] = true;
            $requirements['php_version']['message'] = "PHP {$phpVersion} ✓";
        } else {
            $requirements['php_version']['status'] = false;
            $requirements['php_version']['message'] = "PHP {$phpVersion} (Required: >= 8.3.0)";
            $requirements['php_version']['fix'] = "Update PHP to >= 8.3";
        }
    }


    // Check required PHP extensions
    // Required PHP extensions
    $requiredExtensions = ['openssl', 'pdo', 'mbstring', 'tokenizer', 'xml', 'ctype', 'json', 'bcmath', 'curl', 'zip', 'sodium'];

    // Required PHP functions
    $requiredFunctions = ['passthru', 'shell_exec', 'system', 'exec'];

    $missingExtensions = [];
    foreach ($requiredExtensions as $ext) {
        if (!extension_loaded($ext)) {
            $missingExtensions[] = $ext;
        }
    }

    $disabledFunctions = explode(',', ini_get('disable_functions'));
    $disabledFunctions = array_map('trim', $disabledFunctions);

    $missingFunctions = [];

    // Combine missing extensions and functions
    $missingAll = array_merge($missingExtensions, $missingFunctions);

    if (empty($missingAll)) {
        $requirements['php_extensions']['status'] = true;
        $requirements['php_extensions']['message'] = "All required PHP extensions and functions installed/enabled ✓";
    } else {
        $requirements['php_extensions']['status'] = false;
        $requirements['php_extensions']['message'] = "Missing extensions/functions: " . implode(', ', $missingAll);
        $requirements['php_extensions']['fix'] = "Install missing extensions (e.g., sudo apt-get install php8.4-" . implode(' php8.4-', $missingExtensions) . ")";
    }


    $composerPaths = [
        'composer',                                    // Global command
        '/usr/local/bin/composer',                     // Common global path
        '/usr/bin/composer',                           // Another common path
        __DIR__ . '/composer.phar',                    // Current directory
        __DIR__ . '/../composer.phar',                 // Parent directory
        __DIR__ . '/../../composer.phar',              // Two levels up
    ];

    $composerExecutable = null;

    // First, try to find composer in paths
    foreach ($composerPaths as $path) {
        // Check if it's a file path (contains .phar or /)
        if (strpos($path, '.phar') !== false || strpos($path, '/') === 0) {
            if (file_exists($path) && is_readable($path)) {
                $composerExecutable = "php {$path}";
                break;
            }
        } else {
            // It's a command, use 'which' to find it
            $testResult = shell_exec("which {$path} 2>/dev/null");
            if (!empty($testResult)) {
                $composerExecutable = trim($testResult);
                break;
            }
        }
    }

    // Fallback: Try running composer directly
    if (!$composerExecutable) {
        $testComposer = shell_exec('composer --version 2>/dev/null');
        if (!empty($testComposer)) {
            $composerExecutable = 'composer';
        }
    }

    // Check version if composer is found
    if ($composerExecutable) {
        $composerOutput = shell_exec("{$composerExecutable} --version 2>/dev/null");
        if (preg_match('/Composer version (\d+\.\d+\.\d+)/i', $composerOutput, $matches)) {
            $composerVersion = $matches[1];
            if (version_compare($composerVersion, '2.0.0', '>=')) {
                $requirements['composer_version']['status'] = true;
                $requirements['composer_version']['message'] = "Composer {$composerVersion} ✓ (Location: {$composerExecutable})";
            } else {
                $requirements['composer_version']['message'] = "Composer {$composerVersion} (Required: >= 2.0.0)";
            }
        }
    } else {
        $requirements['composer_version']['message'] = "Composer not found";

        // Provide installation instructions for local installation
        $localInstallPath = dirname($_SERVER['DOCUMENT_ROOT']);
        $requirements['composer_version']['fix'] = [
            'local' => "cd {$localInstallPath} && curl -sS https://getcomposer.org/installer | php",
            'global' => "curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer"
        ];
        $requirements['composer_version']['fix_text'] = "Install locally: cd {$localInstallPath} && curl -sS https://getcomposer.org/installer | php";
    }

    // Check storage folder permissions
    $storagePath = realpath(__DIR__) . '/../storage';
    if (is_dir($storagePath) && is_writable($storagePath)) {
        $storageSubdirs = ['app', 'framework', 'logs'];
        $allWritable = true;
        foreach ($storageSubdirs as $subdir) {
            $subdirPath = $storagePath . '/' . $subdir;
            if (is_dir($subdirPath) && !is_writable($subdirPath)) {
                $allWritable = false;
                break;
            }
        }
        if ($allWritable) {
            $requirements['storage_permissions']['status'] = true;
            $requirements['storage_permissions']['message'] = "Storage folder writable ✓";
        } else {
            $requirements['storage_permissions']['message'] = "Some storage subdirectories not writable";
            $requirements['storage_permissions']['fix'] = "sudo chmod -R 775 storage && sudo chown -R www-data:www-data storage";
        }
    } else {
        $requirements['storage_permissions']['message'] = "Storage folder not writable";
        $requirements['storage_permissions']['fix'] = "sudo chmod -R 775 storage && sudo chown -R www-data:www-data storage";
    }

    // Check bootstrap/cache permissions
    $bootstrapCachePath = realpath(__DIR__) . '/../bootstrap/cache';
    if (is_dir($bootstrapCachePath) && is_writable($bootstrapCachePath)) {
        $requirements['bootstrap_permissions']['status'] = true;
        $requirements['bootstrap_permissions']['message'] = "Bootstrap cache writable ✓";
    } else {
        if (!is_dir($bootstrapCachePath)) {
            @mkdir($bootstrapCachePath, 0775, true);
        }
        if (is_dir($bootstrapCachePath) && is_writable($bootstrapCachePath)) {
            $requirements['bootstrap_permissions']['status'] = true;
            $requirements['bootstrap_permissions']['message'] = "Bootstrap cache created ✓";
        } else {
            $requirements['bootstrap_permissions']['message'] = "Bootstrap cache not writable";
            $requirements['bootstrap_permissions']['fix'] = "sudo chmod -R 775 bootstrap/cache && sudo chown -R www-data:www-data bootstrap/cache";
        }
    }

    return $requirements;
}

/**
 * Update .env file
 */
function updateDotEnv($envValues)
{
    global $envPath, $envExamplePath, $log_output;

    try {
        if (!file_exists($envPath)) {
            if (file_exists($envExamplePath)) {
                copy($envExamplePath, $envPath);
                $log_output[] = ['message' => '.env file created from .env.example.', 'status' => 'info'];
            } else {
                file_put_contents($envPath, '');
                $log_output[] = ['message' => 'Empty .env file created.', 'status' => 'info'];
            }
        }

        $envContent = file_get_contents($envPath);

        foreach ($envValues as $key => $value) {
            $value = $value ?? '';
            if (preg_match('/[\s#"\'$\\\\]/', $value) || empty($value)) {
                $value = '"' . str_replace(['"', '\\'], ['\"', '\\\\'], $value) . '"';
            }
            $pattern = "/^{$key}=.*$/m";
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, "{$key}={$value}", $envContent);
            } else {
                $envContent .= "\n{$key}={$value}";
            }
            $log_output[] = ['message' => "Updated ENV variable: {$key}", 'status' => 'info'];
        }

        file_put_contents($envPath, $envContent);
        return true;
    } catch (\Exception $e) {
        $log_output[] = ['message' => "Failed to update .env: " . $e->getMessage(), 'status' => 'error'];
        return false;
    }
}

/**
 * Test database connection
 */
function testDatabaseConnection($config)
{
    try {
        $dsn = "{$config['connection']}:host={$config['host']};port={$config['port']};dbname={$config['database']}";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        return ['success' => true, 'pdo' => $pdo];
    } catch (\Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Handle step navigation
if (isset($_POST['next_step'])) {
    $_SESSION['installer_step'] = (int)$_POST['next_step'];
}

if (isset($_POST['prev_step'])) {
    $_SESSION['installer_step'] = max(1, $_SESSION['installer_step'] - 1);
}

$currentStep = $_SESSION['installer_step'];

// STEP 1: System Requirements Check
if ($currentStep === 1) {
    $systemRequirements = checkSystemRequirements();
    $allRequirementsMet = true;
    foreach ($systemRequirements as $req) {
        if ($req['required'] && !$req['status']) {
            $allRequirementsMet = false;
            break;
        }
    }

    if (isset($_POST['recheck_requirements'])) {
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    }
?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Step 1: System Requirements</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 0;
            }

            .installer-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 900px;
                margin: 0 auto;
            }

            .brand {
                color: #667eea;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .step-indicator {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }

            .step {
                flex: 1;
                text-align: center;
                position: relative;
            }

            .step::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 50%;
                right: -50%;
                height: 2px;
                background: #e9ecef;
                z-index: -1;
            }

            .step:last-child::before {
                display: none;
            }

            .step.active .step-number {
                background: #667eea;
                color: white;
            }

            .step.completed .step-number {
                background: #28a745;
                color: white;
            }

            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e9ecef;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .requirement-item {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 15px;
                border-left: 4px solid #dee2e6;
            }

            .requirement-item.success {
                border-left-color: #28a745;
                background: #d4edda;
            }

            .requirement-item.error {
                border-left-color: #dc3545;
                background: #f8d7da;
            }

            .fix-command {
                background: #2d3748;
                color: #48bb78;
                padding: 10px;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                margin-top: 10px;
                font-size: 13px;
            }

            .btn-modern {
                border-radius: 12px;
                padding: 12px 30px;
                font-weight: 600;
                border: none;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }

            .btn-primary:disabled {
                background: #6c757d;
                transform: none;
            }
        </style>
    </head>

    <body>
        <div class="installer-card">
            <h1 class="brand text-center">🚀 Project Setup</h1>
            <p class="text-center text-muted mb-4">Complete Setup for Server</p>

            <div class="step-indicator">
                <div class="step active">
                    <div class="step-number">1</div>
                    <div class="small">Requirements</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="small">Dependencies</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="small">Configuration</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="small">Database</div>
                </div>
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="small">Complete</div>
                </div>
            </div>

            <h3 class="mb-4">📋 System Requirements Check</h3>

            <?php foreach ($systemRequirements as $key => $req): ?>
                <div class="requirement-item <?php echo $req['status'] ? 'success' : 'error'; ?>">
                    <div class="d-flex align-items-start">
                        <span style="font-size: 1.5em; margin-right: 15px;">
                            <?php echo $req['status'] ? '✅' : '❌'; ?>
                        </span>
                        <div class="flex-grow-1">
                            <strong>
                                <?php
                                $titles = [
                                    'php_version' => 'PHP Version (>= 8.3)',
                                    'php_extensions' => 'Required PHP Extensions',
                                    'composer_version' => 'Composer (>= 2.0)',
                                    'storage_permissions' => 'Storage Permissions',
                                    'bootstrap_permissions' => 'Bootstrap Cache Permissions'
                                ];
                                echo $titles[$key];
                                if (!$req['required']) echo ' <span class="badge bg-secondary">Optional</span>';
                                ?>
                            </strong>
                            <div class="text-muted mt-1"><?php echo $req['message']; ?></div>
                            <?php if (!$req['status'] && !empty($req['fix'])): ?>
                                <div class="fix-command">
                                    <strong>Fix:</strong> <?php echo htmlspecialchars($req['fix']); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>

            <div class="alert alert-<?php echo $allRequirementsMet ? 'success' : 'warning'; ?> mt-4">
                <?php if ($allRequirementsMet): ?>
                    <strong>✅ All Requirements Met!</strong><br>
                    Your server is ready to proceed with installation.
                <?php else: ?>
                    <strong>⚠️ Action Required</strong><br>
                    Please fix the issues above before continuing. Run the suggested commands in your terminal, then click "Recheck Requirements".
                <?php endif; ?>
            </div>

            <form method="POST" class="text-center mt-4">
                <div class="d-flex gap-3 justify-content-center">
                    <button type="submit" name="recheck_requirements" value="1" class="btn btn-outline-secondary btn-modern">
                        🔄 Recheck Requirements
                    </button>
                    <button type="submit" name="next_step" value="2" class="btn btn-primary btn-modern" <?php echo !$allRequirementsMet ? 'disabled' : ''; ?>>
                        Next: Install Dependencies →
                    </button>
                </div>
            </form>
        </div>
    </body>

    </html>
<?php
    exit;
}

// STEP 2: Install Composer Dependencies
if ($currentStep === 2) {
    if (isset($_POST['run_composer'])) {
        $action = $_POST['run_composer'];
        $composerPaths = [
            'composer',                                    // Global command
            '/usr/local/bin/composer',                     // Common global path
            '/usr/bin/composer',                           // Another common path
            __DIR__ . '/composer.phar',                    // Current directory
            __DIR__ . '/../composer.phar',                 // Parent directory
            __DIR__ . '/../../composer.phar',              // Two levels up
        ];
        $composerExecutable = null;

        foreach ($composerPaths as $path) {
            $testResult = shell_exec("which {$path} 2>/dev/null");
            if (!empty($testResult)) {
                $composerExecutable = trim($testResult);
                break;
            }
        }

        if (!$composerExecutable) {
            $testComposer = shell_exec('composer --version 2>/dev/null');
            if (!empty($testComposer)) {
                $composerExecutable = 'composer';
            }
        }

        if (!$composerExecutable) {
            $installer_message = "Composer executable not found.";
            $installer_status = 'error';
        } else {
            $commandSuffix = ($action === 'install')
                ? 'install --no-interaction --prefer-dist --optimize-autoloader'
                : 'update --no-interaction --prefer-dist --optimize-autoloader';

            $composerCommand = "{$composerExecutable} {$commandSuffix}";
            $result = runShellCommand($composerCommand, "Composer {$action}");

            if ($result['success']) {
                $installer_message = "Composer {$action} completed successfully!";
                $installer_status = 'success';
                $_SESSION['composer_installed'] = true;
            } else {
                $installer_message = "Composer {$action} failed!";
                $installer_status = 'error';
            }
        }
    }

    $vendorExists = is_dir($vendorPath);
?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Step 2: Laravel Dependencies</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 0;
            }

            .installer-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 900px;
                margin: 0 auto;
            }

            .brand {
                color: #667eea;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .step-indicator {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }

            .step {
                flex: 1;
                text-align: center;
                position: relative;
            }

            .step::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 50%;
                right: -50%;
                height: 2px;
                background: #e9ecef;
                z-index: -1;
            }

            .step:last-child::before {
                display: none;
            }

            .step.active .step-number {
                background: #667eea;
                color: white;
            }

            .step.completed .step-number {
                background: #28a745;
                color: white;
            }

            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e9ecef;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .log-container {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                max-height: 400px;
                overflow-y: auto;
                font-family: 'SF Mono', Monaco, monospace;
                font-size: 14px;
            }

            .log-entry {
                margin-bottom: 8px;
            }

            .log-entry.success {
                color: #28a745;
            }

            .log-entry.error {
                color: #dc3545;
            }

            .log-entry.running {
                color: #007bff;
            }

            .log-entry.info {
                color: #6c757d;
            }

            .btn-modern {
                border-radius: 12px;
                padding: 12px 30px;
                font-weight: 600;
                border: none;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }

            .btn-primary:disabled {
                background: #6c757d;
                transform: none;
            }

            .status-box {
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
            }

            .status-success {
                background: #d4edda;
                border: 2px solid #28a745;
            }

            .status-pending {
                background: #fff3cd;
                border: 2px solid #ffc107;
            }
        </style>
    </head>

    <body>
        <div class="installer-card">
            <h1 class="brand text-center">🚀 Project Setup</h1>

            <div class="step-indicator">
                <div class="step completed">
                    <div class="step-number">1</div>
                    <div class="small">Requirements</div>
                </div>
                <div class="step active">
                    <div class="step-number">2</div>
                    <div class="small">Dependencies</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="small">Configuration</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="small">Database</div>
                </div>
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="small">Complete</div>
                </div>
            </div>

            <h3 class="mb-4">📦 Install Laravel Dependencies</h3>

            <?php if (!empty($installer_message)): ?>
                <div class="alert alert-<?php echo $installer_status; ?>" role="alert">
                    <?php echo $installer_message; ?>
                </div>
            <?php endif; ?>

            <div class="status-box <?php echo $vendorExists ? 'status-success' : 'status-pending'; ?>">
                <h5><?php echo $vendorExists ? '✅' : '⏳'; ?> Vendor Directory</h5>
                <p class="mb-0">
                    <?php echo $vendorExists ? 'Composer packages are installed.' : 'Composer packages need to be installed.'; ?>
                </p>
            </div>

            <?php if (!$vendorExists): ?>
                <div class="alert alert-info">
                    <strong>ℹ️ About This Step:</strong><br>
                    This will install all PHP dependencies required by Laravel. This may take several minutes depending on your internet connection.
                </div>

                <form method="POST">
                    <div class="d-grid gap-2">
                        <button type="submit" name="run_composer" value="install" class="btn btn-primary btn-lg btn-modern">
                            📦 Install Composer Dependencies
                        </button>
                    </div>
                </form>
            <?php else: ?>
                <form method="POST">
                    <div class="d-grid gap-2 mb-3">
                        <button type="submit" name="run_composer" value="update" class="btn btn-outline-secondary btn-modern">
                            🔄 Update Dependencies (Optional)
                        </button>
                    </div>
                </form>
            <?php endif; ?>

            <?php if (!empty($log_output)): ?>
                <div class="log-container">
                    <h5 class="mb-3">📋 Installation Log</h5>
                    <?php foreach ($log_output as $entry): ?>
                        <div class="log-entry <?php echo $entry['status']; ?>">
                            <span class="me-2">
                                <?php
                                switch ($entry['status']) {
                                    case 'success':
                                        echo '✅';
                                        break;
                                    case 'error':
                                        echo '❌';
                                        break;
                                    case 'running':
                                        echo '⏳';
                                        break;
                                    default:
                                        echo '➡️';
                                        break;
                                }
                                ?>
                            </span>
                            <span><?php echo htmlspecialchars($entry['message']); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <form method="POST" class="text-center mt-4">
                <div class="d-flex gap-3 justify-content-center">
                    <button type="submit" name="prev_step" value="1" class="btn btn-outline-secondary btn-modern">
                        ← Previous
                    </button>
                    <button type="submit" name="next_step" value="3" class="btn btn-primary btn-modern" <?php echo !$vendorExists ? 'disabled' : ''; ?>>
                        Next: Configure Environment →
                    </button>
                </div>
            </form>
        </div>
    </body>

    </html>
<?php
    exit;
}

// STEP 3: Environment Configuration
if ($currentStep === 3) {
    if (isset($_POST['generate_env'])) {
        $appKey = 'base64:' . base64_encode(random_bytes(32));
        $envData = [
            'APP_NAME' => $_POST['app_name'] ?? 'Laravel',
            'APP_ENV' => $_POST['app_env'] ?? 'production',
            'APP_KEY' => $appKey,
            'APP_DEBUG' => $_POST['app_debug'] ?? 'false',
            'APP_URL' => $_POST['app_url'] ?? (($_SERVER['HTTPS'] ?? '') ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'],
        ];

        if (updateDotEnv($envData)) {
            $installer_message = "Environment configuration saved successfully!";
            $installer_status = 'success';
            $_SESSION['env_configured'] = true;
        } else {
            $installer_message = "Failed to save environment configuration.";
            $installer_status = 'error';
        }
    }

    // Load existing .env values
    $envValues = [];
    if (file_exists($envPath)) {
        $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($envLines as $line) {
            if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
                [$key, $value] = explode('=', $line, 2);
                $envValues[trim($key)] = trim($value, '"\'');
            }
        }
    }

    $envConfigured = !empty($envValues['APP_KEY']);
?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Step 3: Environment Configuration</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 0;
            }

            .installer-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 900px;
                margin: 0 auto;
            }

            .brand {
                color: #667eea;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .step-indicator {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }

            .step {
                flex: 1;
                text-align: center;
                position: relative;
            }

            .step::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 50%;
                right: -50%;
                height: 2px;
                background: #e9ecef;
                z-index: -1;
            }

            .step:last-child::before {
                display: none;
            }

            .step.active .step-number {
                background: #667eea;
                color: white;
            }

            .step.completed .step-number {
                background: #28a745;
                color: white;
            }

            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e9ecef;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .form-control,
            .form-select {
                border-radius: 10px;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
            }

            .form-control:focus,
            .form-select:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
            }

            .btn-modern {
                border-radius: 12px;
                padding: 12px 30px;
                font-weight: 600;
                border: none;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
        </style>
    </head>

    <body>
        <div class="installer-card">
            <h1 class="brand text-center">🚀 Project Setup</h1>

            <div class="step-indicator">
                <div class="step completed">
                    <div class="step-number">1</div>
                    <div class="small">Requirements</div>
                </div>
                <div class="step completed">
                    <div class="step-number">2</div>
                    <div class="small">Dependencies</div>
                </div>
                <div class="step active">
                    <div class="step-number">3</div>
                    <div class="small">Configuration</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="small">Database</div>
                </div>
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="small">Complete</div>
                </div>
            </div>

            <h3 class="mb-4">⚙️ Environment Configuration</h3>

            <?php if (!empty($installer_message)): ?>
                <div class="alert alert-<?php echo $installer_status; ?>" role="alert">
                    <?php echo $installer_message; ?>
                </div>
            <?php endif; ?>

            <div class="alert alert-info mb-4">
                <strong>ℹ️ About This Step:</strong><br>
                Configure basic application settings. An APP_KEY will be generated automatically for security.
            </div>

            <form method="POST">
                <div class="row g-3">
                    <div class="col-md-12">
                        <label class="form-label">Application Name</label>
                        <input type="text" class="form-control" name="app_name" value="<?php echo htmlspecialchars($envValues['APP_NAME'] ?? 'Laravel'); ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Environment</label>
                        <select class="form-select" name="app_env" required>
                            <option value="production" <?php echo ($envValues['APP_ENV'] ?? 'production') === 'production' ? 'selected' : ''; ?>>Production</option>
                            <option value="local" <?php echo ($envValues['APP_ENV'] ?? '') === 'local' ? 'selected' : ''; ?>>Local</option>
                            <option value="staging" <?php echo ($envValues['APP_ENV'] ?? '') === 'staging' ? 'selected' : ''; ?>>Staging</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Debug Mode</label>
                        <select class="form-select" name="app_debug" required>
                            <option value="false" <?php echo ($envValues['APP_DEBUG'] ?? 'false') === 'false' ? 'selected' : ''; ?>>Disabled (Recommended for Production)</option>
                            <option value="true" <?php echo ($envValues['APP_DEBUG'] ?? '') === 'true' ? 'selected' : ''; ?>>Enabled</option>
                        </select>
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Application URL</label>
                        <input type="url" class="form-control" name="app_url" value="<?php echo htmlspecialchars($envValues['APP_URL'] ?? (($_SERVER['HTTPS'] ?? '') ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']); ?>" required>
                    </div>
                </div>

                <?php if ($envConfigured): ?>
                    <div class="alert alert-success mt-4">
                        ✅ Environment is already configured. You can update settings or proceed to the next step.
                    </div>
                <?php endif; ?>

                <div class="d-grid gap-2 mt-4">
                    <button type="submit" name="generate_env" class="btn btn-primary btn-modern">
                        <?php echo $envConfigured ? '🔄 Update Configuration' : '💾 Save Configuration'; ?>
                    </button>
                </div>
            </form>

            <form method="POST" class="text-center mt-4">
                <div class="d-flex gap-3 justify-content-center">
                    <button type="submit" name="prev_step" value="2" class="btn btn-outline-secondary btn-modern">
                        ← Previous
                    </button>
                    <button type="submit" name="next_step" value="4" class="btn btn-primary btn-modern" <?php echo !$envConfigured ? 'disabled' : ''; ?>>
                        Next: Database Setup →
                    </button>
                </div>
            </form>
        </div>
    </body>

    </html>
<?php
    exit;
}

// STEP 4: Database Configuration & Migration
if ($currentStep === 4) {
    if (isset($_POST['test_database'])) {
        $dbConfig = [
            'connection' => $_POST['db_connection'] ?? 'mysql',
            'host' => $_POST['db_host'] ?? '127.0.0.1',
            'port' => $_POST['db_port'] ?? '3306',
            'database' => $_POST['db_database'],
            'username' => $_POST['db_username'],
            'password' => $_POST['db_password'] ?? ''
        ];

        $dbTest = testDatabaseConnection($dbConfig);
        if ($dbTest['success']) {
            $installer_message = "Database connection successful!";
            $installer_status = 'success';
            $_SESSION['db_config'] = $dbConfig;
        } else {
            $installer_message = "Database connection failed: " . $dbTest['error'];
            $installer_status = 'error';
        }
    }

    if (isset($_POST['run_migration'])) {
        // First, check if we have DB config from test
        if (empty($_SESSION['db_config'])) {
            $installer_message = "Please test database connection first.";
            $installer_status = 'error';
        } else {
            $dbConfig = $_SESSION['db_config'];

            // Step 1: Update .env with database config FIRST
            $envData = [
                'DB_CONNECTION' => $dbConfig['connection'],
                'DB_HOST' => $dbConfig['host'],
                'DB_PORT' => $dbConfig['port'],
                'DB_DATABASE' => $dbConfig['database'],
                'DB_USERNAME' => $dbConfig['username'],
                'DB_PASSWORD' => $dbConfig['password']
            ];

            if (!updateDotEnv($envData)) {
                $installer_message = 'Failed to update .env file.';
                $installer_status = 'error';
            } else {
                $log_output[] = ['message' => '✅ Database configuration saved to .env', 'status' => 'success'];
                foreach ($envData as $key => $value) {
                    if (!array_key_exists($key, $_ENV)) {
                        $_ENV[$key] = $value;
                        putenv("{$key}={$value}");
                    }
                }
                // Step 2: Clear ALL caches to reload .env
                $log_output[] = ['message' => '⏳ Clearing configuration cache...', 'status' => 'info'];
                @unlink(realpath(__DIR__) . '/../bootstrap/cache/config.php');
                @unlink(realpath(__DIR__) . '/../bootstrap/cache/cache.php');
                @unlink(realpath(__DIR__) . '/../bootstrap/cache/routes-v7.php');
                @unlink(realpath(__DIR__) . '/../bootstrap/cache/services.php');

                // Clear artisan caches without using database
                $projectRoot = realpath(__DIR__ . '/..');
                $clearCommands = [
                    'config:clear' => 'Configuration cache cleared',
                    'cache:clear --no-interaction' => 'Application cache cleared',
                    'view:clear' => 'View cache cleared'
                ];

                foreach ($clearCommands as $cmd => $msg) {
                    try {
                        @shell_exec("cd {$projectRoot} && php artisan {$cmd} 2>&1");
                        $log_output[] = ['message' => "✅ {$msg}", 'status' => 'success'];
                    } catch (\Exception $e) {
                        // Continue even if cache clear fails
                    }
                }

                // Step 3: Validate admin input
                if (empty($_POST['admin_email']) || empty($_POST['admin_password'])) {
                    $installer_message = "Admin email and password are required!";
                    $installer_status = 'error';
                } elseif ($_POST['admin_password'] !== $_POST['admin_password_confirm']) {
                    $installer_message = "Password confirmation does not match!";
                    $installer_status = 'error';
                } else {
                    // Step 4: Run migrations
                    $migrateResult = runShellCommand('php artisan migrate --force', 'Running database migrations');

                    if ($migrateResult['success']) {
                        $log_output[] = ['message' => "✅ Database migrations completed successfully!", 'status' => 'success'];

                        // Step 5: Create admin user
                        try {
                            $pdo = new PDO(
                                "{$dbConfig['connection']}:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}",
                                $dbConfig['username'],
                                $dbConfig['password'],
                                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                            );

                            $adminEmail = trim($_POST['admin_email']);
                            $adminName = trim($_POST['admin_name'] ?? 'Admin');
                            $adminPassword = password_hash($_POST['admin_password'], PASSWORD_BCRYPT);

                            // Check if user already exists
                            $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
                            $checkStmt->execute([$adminEmail]);

                            if ($checkStmt->fetchColumn() > 0) {
                                $log_output[] = ['message' => "ℹ️ Admin user already exists: {$adminEmail}", 'status' => 'info'];
                            } else {
                                // Check if users table has 'role' column
                                $columnsStmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'role'");
                                $hasRoleColumn = $columnsStmt->rowCount() > 0;

                                if ($hasRoleColumn) {
                                    // Insert with role column
                                    $insertStmt = $pdo->prepare("
                                    INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at)
                                    VALUES (?, ?, ?, 'admin', NOW(), NOW(), NOW())
                                ");
                                    $insertStmt->execute([$adminName, $adminEmail, $adminPassword]);
                                } else {
                                    // Insert without role column
                                    $insertStmt = $pdo->prepare("
                                    INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
                                    VALUES (?, ?, ?, NOW(), NOW(), NOW())
                                ");
                                    $insertStmt->execute([$adminName, $adminEmail, $adminPassword]);
                                    $log_output[] = ['message' => "ℹ️ Note: 'role' column not found in users table", 'status' => 'info'];
                                }

                                $log_output[] = ['message' => "✅ Admin user created successfully: {$adminEmail}", 'status' => 'success'];
                            }

                            // Step 6: Create storage link
                            runShellCommand('php artisan storage:link', 'Creating storage symlink');
                            runShellCommand('php artisan db:seed --force', 'Executing DB Seeded');

                            // Mark installation as successful
                            $_SESSION['migrations_run'] = true;
                            $_SESSION['installer_step'] = 5; // Set step to 5 before redirect
                            header("Location: " . $_SERVER['PHP_SELF']);
                            exit;
                            $installer_message = "✅ Database setup completed successfully"; // Optional message update
                            $installer_status = 'success';
                        } catch (\Exception $e) {
                            $installer_message = "Admin user creation failed: " . $e->getMessage();
                            $installer_status = 'error';
                            $log_output[] = ['message' => "❌ Admin user creation failed: " . $e->getMessage(), 'status' => 'error'];
                        }
                    } else {
                        $installer_message = "Database migrations failed!";
                        $installer_status = 'error';
                    }
                }
            }
        }
    }

    $envValues = [];
    if (file_exists($envPath)) {
        $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($envLines as $line) {
            if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
                [$key, $value] = explode('=', $line, 2);
                $envValues[trim($key)] = trim($value, '"\'');
            }
        }
    }

    $migrationsRun = $_SESSION['migrations_run'] ?? false;
?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Step 4: Database Setup</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 0;
            }

            .installer-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 900px;
                margin: 0 auto;
            }

            .brand {
                color: #667eea;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .step-indicator {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }

            .step {
                flex: 1;
                text-align: center;
                position: relative;
            }

            .step::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 50%;
                right: -50%;
                height: 2px;
                background: #e9ecef;
                z-index: -1;
            }

            .step:last-child::before {
                display: none;
            }

            .step.active .step-number {
                background: #667eea;
                color: white;
            }

            .step.completed .step-number {
                background: #28a745;
                color: white;
            }

            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e9ecef;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .form-control,
            .form-select {
                border-radius: 10px;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
            }

            .form-control:focus,
            .form-select:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
            }

            .btn-modern {
                border-radius: 12px;
                padding: 12px 30px;
                font-weight: 600;
                border: none;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .log-container {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                max-height: 300px;
                overflow-y: auto;
                font-family: 'SF Mono', Monaco, monospace;
                font-size: 14px;
            }

            .log-entry {
                margin-bottom: 8px;
            }

            .log-entry.success {
                color: #28a745;
            }

            .log-entry.error {
                color: #dc3545;
            }

            .section-divider {
                border-top: 2px solid #e9ecef;
                margin: 30px 0;
            }
        </style>
    </head>

    <body>
        <div class="installer-card">
            <h1 class="brand text-center">🚀 Project Setup</h1>

            <div class="step-indicator">
                <div class="step completed">
                    <div class="step-number">1</div>
                    <div class="small">Requirements</div>
                </div>
                <div class="step completed">
                    <div class="step-number">2</div>
                    <div class="small">Dependencies</div>
                </div>
                <div class="step completed">
                    <div class="step-number">3</div>
                    <div class="small">Configuration</div>
                </div>
                <div class="step active">
                    <div class="step-number">4</div>
                    <div class="small">Database</div>
                </div>
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="small">Complete</div>
                </div>
            </div>

            <h3 class="mb-4">🗄️ Database Configuration</h3>

            <?php if (!empty($installer_message)): ?>
                <div class="alert alert-<?php echo $installer_status; ?>" role="alert">
                    <?php echo $installer_message; ?>
                </div>
            <?php endif; ?>

            <?php if (!$migrationsRun): ?>
                <form method="POST">
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <label class="form-label">Database Type</label>
                            <select class="form-select" name="db_connection" required>
                                <option value="mysql" <?php echo (($dbConfig['connection'] ?? $envValues['DB_CONNECTION'] ?? 'mysql') === 'mysql' ? 'selected' : ''); ?>>MySQL</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Host</label>
                            <input type="text" class="form-control" name="db_host" value="<?php echo htmlspecialchars($dbConfig['host'] ?? $envValues['DB_HOST'] ?? '127.0.0.1'); ?>" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Port</label>
                            <input type="number" class="form-control" name="db_port" value="<?php echo htmlspecialchars($dbConfig['port'] ?? $envValues['DB_PORT'] ?? '3306'); ?>" required>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label">Database Name</label>
                            <input type="text" class="form-control" name="db_database" value="<?php echo htmlspecialchars($dbConfig['database'] ?? $envValues['DB_DATABASE'] ?? ''); ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" name="db_username" value="<?php echo htmlspecialchars($dbConfig['username'] ?? $envValues['DB_USERNAME'] ?? ''); ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-control" name="db_password" value="<?php echo htmlspecialchars($dbConfig['password'] ?? $envValues['DB_PASSWORD'] ?? ''); ?>">
                        </div>
                    </div>

                    <div class="d-grid gap-2 mb-3">
                        <button type="submit" name="test_database" class="btn btn-outline-primary btn-modern">
                            🔍 Test Database Connection
                        </button>
                    </div>

                    <?php if (isset($_SESSION['db_config'])): ?>
                        <hr class="section-divider">
                        <h4 class="mb-3">👤 Create Admin User (Required)</h4>
                        <div class="alert alert-warning">
                            <strong>⚠️ Important:</strong> You must create an admin user to access the application.
                        </div>
                        <div class="row g-3 mb-4">
                            <div class="col-md-12">
                                <label class="form-label">Admin Name <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" name="admin_name" placeholder="Administrator" value="Admin" required>
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Admin Email <span class="text-danger">*</span></label>
                                <input type="email" class="form-control" name="admin_email" placeholder="admin@example.com" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Admin Password <span class="text-danger">*</span></label>
                                <input type="password" class="form-control" name="admin_password" id="admin_password" minlength="8" required>
                                <small class="text-muted">Minimum 8 characters</small>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                                <input type="password" class="form-control" name="admin_password_confirm" id="admin_password_confirm" minlength="8" required>
                            </div>
                        </div>

                        <script>
                            function validateAdminForm(form) {
                                const password = form.admin_password.value;
                                const confirm = form.admin_password_confirm.value;
                                const email = form.admin_email.value;

                                if (!email) {
                                    alert('Admin email is required!');
                                    return false;
                                }

                                if (!password || password.length < 8) {
                                    alert('Password must be at least 8 characters!');
                                    return false;
                                }

                                if (password !== confirm) {
                                    alert('Passwords do not match!');
                                    return false;
                                }

                                return true;
                            }
                        </script>

                        <div class="d-grid gap-2">
                            <button type="submit" name="run_migration" class="btn btn-primary btn-modern btn-lg" onclick="return validateAdminForm(this.form)">
                                🚀 Run Migrations & Create Admin
                            </button>
                        </div>
                    <?php endif; ?>
                </form>
            <?php else: ?>
                <div class="alert alert-success">
                    ✅ Database has been configured and migrations completed successfully!
                </div>
            <?php endif; ?>

            <?php if (!empty($log_output)): ?>
                <div class="log-container">
                    <h5 class="mb-3">📋 Migration Log</h5>
                    <?php foreach ($log_output as $entry): ?>
                        <div class="log-entry <?php echo $entry['status']; ?>">
                            <span class="me-2">
                                <?php
                                switch ($entry['status']) {
                                    case 'success':
                                        echo '✅';
                                        break;
                                    case 'error':
                                        echo '❌';
                                        break;
                                    case 'running':
                                        echo '⏳';
                                        break;
                                    default:
                                        echo '➡️';
                                        break;
                                }
                                ?>
                            </span>
                            <span><?php echo htmlspecialchars($entry['message']); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <form method="POST" class="text-center mt-4">
                <div class="d-flex gap-3 justify-content-center">
                    <button type="submit" name="prev_step" value="3" class="btn btn-outline-secondary btn-modern">
                        ← Previous
                    </button>
                    <button type="submit" name="next_step" value="5" class="btn btn-primary btn-modern" <?php echo !$migrationsRun ? 'disabled' : ''; ?>>
                        Complete Installation →
                    </button>
                </div>
            </form>
        </div>
    </body>

    </html>
<?php
    exit;
}


// STEP 5: Final Configuration & Completion
if ($currentStep === 5) {
    if (isset($_POST['finalize_installation'])) {
        // Run final optimization commands
        runShellCommand('php artisan config:cache', 'Caching configuration');
        runShellCommand('php artisan route:cache', 'Caching routes');
        runShellCommand('php artisan view:cache', 'Caching views');

        // Mark installation as complete
        $_SESSION['installation_complete'] = true;
        $installer_message = "Installation completed successfully!";
        $installer_status = 'success';
    }

    if (isset($_POST['finish_and_launch'])) {
        // Clear installer session and redirect to application
        session_destroy();
        header("Location: /");
        exit;
    }

    $installationComplete = $_SESSION['installation_complete'] ?? false;
?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Step 5: Installation Complete</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 0;
            }

            .installer-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 40px;
                max-width: 900px;
                margin: 0 auto;
            }

            .brand {
                color: #667eea;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .step-indicator {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }

            .step {
                flex: 1;
                text-align: center;
                position: relative;
            }

            .step::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 50%;
                right: -50%;
                height: 2px;
                background: #e9ecef;
                z-index: -1;
            }

            .step:last-child::before {
                display: none;
            }

            .step.active .step-number {
                background: #667eea;
                color: white;
            }

            .step.completed .step-number {
                background: #28a745;
                color: white;
            }

            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e9ecef;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .btn-modern {
                border-radius: 12px;
                padding: 12px 30px;
                font-weight: 600;
                border: none;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .btn-success {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
            }

            .success-animation {
                text-align: center;
                margin: 40px 0;
            }

            .success-icon {
                font-size: 80px;
                animation: scaleIn 0.5s ease-out;
            }

            @keyframes scaleIn {
                from {
                    transform: scale(0);
                }

                to {
                    transform: scale(1);
                }
            }

            .checklist {
                list-style: none;
                padding: 0;
            }

            .checklist li {
                padding: 15px;
                margin: 10px 0;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #28a745;
            }

            .log-container {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                max-height: 300px;
                overflow-y: auto;
                font-family: 'SF Mono', Monaco, monospace;
                font-size: 14px;
            }

            .log-entry {
                margin-bottom: 8px;
            }

            .log-entry.success {
                color: #28a745;
            }

            .log-entry.error {
                color: #dc3545;
            }
        </style>
    </head>

    <body>
        <div class="installer-card">
            <h1 class="brand text-center">🚀 Project Setup</h1>

            <div class="step-indicator">
                <div class="step completed">
                    <div class="step-number">1</div>
                    <div class="small">Requirements</div>
                </div>
                <div class="step completed">
                    <div class="step-number">2</div>
                    <div class="small">Dependencies</div>
                </div>
                <div class="step completed">
                    <div class="step-number">3</div>
                    <div class="small">Configuration</div>
                </div>
                <div class="step completed">
                    <div class="step-number">4</div>
                    <div class="small">Database</div>
                </div>
                <div class="step completed">
                    <div class="step-number">5</div>
                    <div class="small">Complete</div>
                </div>
            </div>

            <?php if (!$installationComplete): ?>
                <h3 class="mb-4">🎯 Finalize Installation</h3>

                <div class="alert alert-info mb-4">
                    <strong>ℹ️ Final Steps:</strong><br>
                    We'll optimize your application by caching configuration, routes, and views for better performance.
                </div>

                <ul class="checklist">
                    <li><strong>✅ System Requirements</strong> - All checks passed</li>
                    <li><strong>✅ Laravel Dependencies</strong> - Composer packages installed</li>
                    <li><strong>✅ Environment Configuration</strong> - .env file configured</li>
                    <li><strong>✅ Database Setup</strong> - Migrations completed & Admin created</li>
                </ul>

                <form method="POST" class="mt-4">
                    <div class="d-grid gap-2">
                        <button type="submit" name="finalize_installation" class="btn btn-success btn-lg btn-modern">
                            🎉 Complete Installation
                        </button>
                    </div>
                </form>

            <?php else: ?>
                <div class="success-animation">
                    <div class="success-icon">🎉</div>
                    <h2 class="text-success mt-3">Installation Complete!</h2>
                    <p class="text-muted">Your Laravel application is ready to use.</p>
                </div>

                <div class="alert alert-success">
                    <h5>✅ What's Been Configured:</h5>
                    <ul class="mb-0">
                        <li>Laravel framework with all dependencies</li>
                        <li>Database connection and migrations</li>
                        <li>Admin user account created</li>
                        <li>Optimized caches for production</li>
                    </ul>
                </div>

                <div class="alert alert-warning">
                    <h5>⚠️ Important Security Steps:</h5>
                    <ol class="mb-0">
                        <li><strong>Delete this installer:</strong> Remove or rename <code>index.php</code> in public folder</li>
                        <li><strong>File Permissions:</strong> Set proper permissions (755 for directories, 644 for files)</li>
                        <li><strong>Environment:</strong> Review your .env file for production settings</li>
                        <li><strong>SSL Certificate:</strong> Set up HTTPS for production</li>
                    </ol>
                </div>

                <div class="alert alert-info">
                    <h5>📚 Useful Commands:</h5>
                    <div class="small">
                        <strong>Clear caches:</strong> <code>php artisan cache:clear</code><br>
                        <strong>Run migrations:</strong> <code>php artisan migrate</code><br>
                        <strong>View logs:</strong> <code>tail -f storage/logs/laravel.log</code>
                    </div>
                </div>

                <form method="POST" class="text-center mt-4">
                    <button type="submit" name="finish_and_launch" class="btn btn-success btn-lg btn-modern">
                        🚀 Launch Application
                    </button>
                </form>
            <?php endif; ?>

            <?php if (!empty($log_output)): ?>
                <div class="log-container">
                    <h5 class="mb-3">📋 Finalization Log</h5>
                    <?php foreach ($log_output as $entry): ?>
                        <div class="log-entry <?php echo $entry['status']; ?>">
                            <span class="me-2">
                                <?php
                                switch ($entry['status']) {
                                    case 'success':
                                        echo '✅';
                                        break;
                                    case 'error':
                                        echo '❌';
                                        break;
                                    case 'running':
                                        echo '⏳';
                                        break;
                                    default:
                                        echo '➡️';
                                        break;
                                }
                                ?>
                            </span>
                            <span><?php echo htmlspecialchars($entry['message']); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if (!$installationComplete): ?>
                <form method="POST" class="text-center mt-4">
                    <button type="submit" name="prev_step" value="4" class="btn btn-outline-secondary btn-modern">
                        ← Previous
                    </button>
                </form>
            <?php endif; ?>
        </div>
    </body>

    </html>
<?php
    exit;
}
