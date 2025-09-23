#!/usr/bin/env node
/**
 * Production Build Script
 * Handles production build with optimizations and security checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Production Build Process...\n');

// 1. Environment Validation
console.log('1️⃣ Validating Environment...');
try {
  // Check if production env file exists
  const envFile = path.join(__dirname, '../env.production.example');
  if (!fs.existsSync(envFile)) {
    console.warn('⚠️  env.production.example not found. Please create it.');
  } else {
    console.log('✅ Environment configuration found');
  }
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

// 2. Clean previous build
console.log('\n2️⃣ Cleaning previous build...');
try {
  execSync('rm -rf dist', { stdio: 'inherit' });
  console.log('✅ Previous build cleaned');
} catch (error) {
  console.log('ℹ️  No previous build to clean');
}

// 3. Install dependencies
console.log('\n3️⃣ Installing dependencies...');
try {
  execSync('npm ci --production=false', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Dependency installation failed:', error.message);
  process.exit(1);
}

// 4. Run type checking
console.log('\n4️⃣ Running type checking...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type checking passed');
} catch (error) {
  console.error('❌ Type checking failed:', error.message);
  process.exit(1);
}

// 5. Run linting
console.log('\n5️⃣ Running linting...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  console.warn('⚠️  Linting issues found, but continuing build...');
}

// 6. Build for production
console.log('\n6️⃣ Building for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build completed');
} catch (error) {
  console.error('❌ Production build failed:', error.message);
  process.exit(1);
}

// 7. Bundle analysis
console.log('\n7️⃣ Analyzing bundle size...');
try {
  const distPath = path.join(__dirname, '../dist');
  const stats = fs.statSync(path.join(distPath, 'index.html'));
  const jsFiles = fs.readdirSync(path.join(distPath, 'assets'))
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(distPath, 'assets', file);
      const size = fs.statSync(filePath).size;
      return { file, size: (size / 1024).toFixed(2) + ' KB' };
    });
  
  console.log('📊 Bundle Analysis:');
  jsFiles.forEach(({ file, size }) => {
    console.log(`   ${file}: ${size}`);
  });
} catch (error) {
  console.warn('⚠️  Bundle analysis failed:', error.message);
}

// 8. Security checks
console.log('\n8️⃣ Running security checks...');
try {
  // Check for sensitive data in build
  const distPath = path.join(__dirname, '../dist');
  const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
  
  const sensitivePatterns = [
    /localhost/gi,
    /development/gi,
    /debug/gi,
    /console\.log/gi
  ];
  
  const issues = [];
  sensitivePatterns.forEach((pattern, index) => {
    if (pattern.test(indexHtml)) {
      issues.push(`Pattern ${index + 1} found in build`);
    }
  });
  
  if (issues.length > 0) {
    console.warn('⚠️  Security issues found:', issues);
  } else {
    console.log('✅ Security checks passed');
  }
} catch (error) {
  console.warn('⚠️  Security checks failed:', error.message);
}

console.log('\n🎉 Production build completed successfully!');
console.log('📁 Build files are in the dist/ directory');
console.log('🌐 Ready for deployment!');

// 9. Deployment instructions
console.log('\n📋 Deployment Instructions:');
console.log('1. Copy env.production.example to .env.production');
console.log('2. Update environment variables in .env.production');
console.log('3. Deploy dist/ directory to your web server');
console.log('4. Configure your web server to serve index.html for all routes');
console.log('5. Enable HTTPS and set security headers');
