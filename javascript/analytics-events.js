/*
    ╔══════════════════════════════════════════════════╗
    ║  📊 ANALYTICS EVENTS - Event-Definitionen       ║
    ║  Vordefinierte Events für konsistentes Tracking ║
    ║                                                  ║
    ║  Entwickler: Nico Kaschube                      ║
    ║  Berufsbildungswerk im Oberlinhaus Potsdam | 2025║
    ╚══════════════════════════════════════════════════╝
*/

// ==================== ANALYTICS EVENTS ====================
// 📊 Vordefinierte Event-Kategorien & Actions
// =============================================================================

class AnalyticsEvents {
    constructor(analyticsManager) {
        this.analytics = analyticsManager;
    }
    
    // =========================================================================
    // GAMEPLAY EVENTS
    // =========================================================================
    
    gameStarted(mode, categories, settings) {
        this.analytics.trackEvent('gameplay', 'game_started', {
            mode: mode,
            categoriesCount: categories.length,
            settings: settings
        });
    }
    
    gameEnded(duration, score, completed) {
        this.analytics.trackEvent('gameplay', 'game_ended', {
            duration: duration,
            score: score,
            completed: completed
        });
    }
    
    questionAnswered(category, difficulty, correct, timeSpent) {
        this.analytics.trackEvent('gameplay', 'question_answered', {
            category: category,
            difficulty: difficulty,
            correct: correct,
            timeSpent: timeSpent
        });
    }
    
    questionSkipped(category, difficulty, reason) {
        this.analytics.trackEvent('gameplay', 'question_skipped', {
            category: category,
            difficulty: difficulty,
            reason: reason
        });
    }
    
    categorySelected(categoryName) {
        this.analytics.trackEvent('gameplay', 'category_selected', {
            category: categoryName
        });
    }
    
    difficultySelected(level) {
        this.analytics.trackEvent('gameplay', 'difficulty_selected', {
            level: level
        });
    }
    
    jokerUsed(jokerType, questionsRemaining) {
        this.analytics.trackEvent('gameplay', 'joker_used', {
            type: jokerType,
            questionsRemaining: questionsRemaining
        });
    }
    
    timerExpired(category, difficulty, questionsAnswered) {
        this.analytics.trackEvent('gameplay', 'timer_expired', {
            category: category,
            difficulty: difficulty,
            questionsAnswered: questionsAnswered
        });
    }
    
    // =========================================================================
    // NAVIGATION EVENTS
    // =========================================================================
    
    screenViewed(screenName) {
        this.analytics.trackEvent('navigation', 'screen_viewed', {
            screen: screenName
        });
    }
    
    buttonClicked(buttonId, context) {
        this.analytics.trackEvent('navigation', 'button_clicked', {
            buttonId: buttonId,
            context: context
        });
    }
    
    modalOpened(modalName) {
        this.analytics.trackEvent('navigation', 'modal_opened', {
            modal: modalName
        });
    }
    
    modalClosed(modalName, duration) {
        this.analytics.trackEvent('navigation', 'modal_closed', {
            modal: modalName,
            duration: duration
        });
    }
    
    linkClicked(linkText, url) {
        this.analytics.trackEvent('navigation', 'link_clicked', {
            text: linkText,
            url: url
        });
    }
    
    // =========================================================================
    // SETTINGS & PREFERENCES
    // =========================================================================
    
    themeChanged(oldTheme, newTheme) {
        this.analytics.trackEvent('settings', 'theme_changed', {
            from: oldTheme,
            to: newTheme
        });
    }
    
    soundVolumeChanged(oldVolume, newVolume) {
        this.analytics.trackEvent('settings', 'sound_volume_changed', {
            from: oldVolume,
            to: newVolume
        });
    }
    
    soundToggled(enabled) {
        this.analytics.trackEvent('settings', 'sound_toggled', {
            enabled: enabled
        });
    }
    
    difficultyPreferenceChanged(oldDifficulty, newDifficulty) {
        this.analytics.trackEvent('settings', 'difficulty_preference_changed', {
            from: oldDifficulty,
            to: newDifficulty
        });
    }
    
    timerPreferenceChanged(enabled) {
        this.analytics.trackEvent('settings', 'timer_preference_changed', {
            enabled: enabled
        });
    }
    
    // =========================================================================
    // AUTH EVENTS
    // =========================================================================
    
    userLoggedIn(role) {
        this.analytics.trackEvent('auth', 'user_logged_in', {
            role: role
        });
    }
    
    userLoggedOut(sessionDuration) {
        this.analytics.trackEvent('auth', 'user_logged_out', {
            sessionDuration: sessionDuration
        });
    }
    
    userRegistered(role) {
        this.analytics.trackEvent('auth', 'user_registered', {
            role: role
        });
    }
    
    loginFailed(reason) {
        this.analytics.trackEvent('auth', 'login_failed', {
            reason: reason
        });
    }
    
    permissionDenied(feature, requiredRole) {
        this.analytics.trackEvent('auth', 'permission_denied', {
            feature: feature,
            requiredRole: requiredRole
        });
    }
    
    // =========================================================================
    // EDITOR EVENTS
    // =========================================================================
    
    editorOpened() {
        this.analytics.trackEvent('editor', 'opened');
    }
    
    editorClosed(duration) {
        this.analytics.trackEvent('editor', 'closed', {
            duration: duration
        });
    }
    
    questionCreated(category, difficulty) {
        this.analytics.trackEvent('editor', 'question_created', {
            category: category,
            difficulty: difficulty
        });
    }
    
    questionEdited(category, difficulty) {
        this.analytics.trackEvent('editor', 'question_edited', {
            category: category,
            difficulty: difficulty
        });
    }
    
    questionDeleted(category, difficulty) {
        this.analytics.trackEvent('editor', 'question_deleted', {
            category: category,
            difficulty: difficulty
        });
    }
    
    categoryCreated(categoryName) {
        this.analytics.trackEvent('editor', 'category_created', {
            category: categoryName
        });
    }
    
    categoryDeleted(categoryName, questionCount) {
        this.analytics.trackEvent('editor', 'category_deleted', {
            category: categoryName,
            questionCount: questionCount
        });
    }
    
    bulkImport(categoryCount, questionCount, format) {
        this.analytics.trackEvent('editor', 'bulk_import', {
            categories: categoryCount,
            questions: questionCount,
            format: format
        });
    }
    
    bulkExport(categoryCount, questionCount, format) {
        this.analytics.trackEvent('editor', 'bulk_export', {
            categories: categoryCount,
            questions: questionCount,
            format: format
        });
    }
    
    // =========================================================================
    // STATISTICS EVENTS
    // =========================================================================
    
    statsViewed(viewType) {
        this.analytics.trackEvent('statistics', 'viewed', {
            type: viewType
        });
    }
    
    statsExported(format, dataRange) {
        this.analytics.trackEvent('statistics', 'exported', {
            format: format,
            range: dataRange
        });
    }
    
    highscoreViewed(category, mode) {
        this.analytics.trackEvent('statistics', 'highscore_viewed', {
            category: category,
            mode: mode
        });
    }
    
    achievementUnlocked(achievementId, achievementName) {
        this.analytics.trackEvent('statistics', 'achievement_unlocked', {
            id: achievementId,
            name: achievementName
        });
    }
    
    // =========================================================================
    // PERFORMANCE EVENTS
    // =========================================================================
    
    pageLoadTime(duration) {
        this.analytics.trackEvent('performance', 'page_load', {
            duration: duration
        });
    }
    
    gameInitTime(duration) {
        this.analytics.trackEvent('performance', 'game_init', {
            duration: duration
        });
    }
    
    questionsLoadTime(count, duration) {
        this.analytics.trackEvent('performance', 'questions_load', {
            count: count,
            duration: duration
        });
    }
    
    animationLag(animationType, lagDuration) {
        this.analytics.trackEvent('performance', 'animation_lag', {
            type: animationType,
            lag: lagDuration
        });
    }
    
    // =========================================================================
    // ERROR EVENTS (automatisch getrackt, aber manuelle Ergänzungen möglich)
    // =========================================================================
    
    customError(errorType, errorMessage, context) {
        this.analytics.trackEvent('error', 'custom', {
            type: errorType,
            message: errorMessage,
            context: context
        });
    }
    
    validationError(field, validationType) {
        this.analytics.trackEvent('error', 'validation', {
            field: field,
            type: validationType
        });
    }
    
    dataLoadError(dataType, errorMessage) {
        this.analytics.trackEvent('error', 'data_load', {
            dataType: dataType,
            message: errorMessage
        });
    }
    
    // =========================================================================
    // FEATURE USAGE
    // =========================================================================
    
    featureUsed(featureName, context) {
        this.analytics.trackEvent('feature', 'used', {
            feature: featureName,
            context: context
        });
    }
    
    tooltipShown(tooltipId) {
        this.analytics.trackEvent('feature', 'tooltip_shown', {
            tooltip: tooltipId
        });
    }
    
    tutorialCompleted(tutorialName, duration) {
        this.analytics.trackEvent('feature', 'tutorial_completed', {
            tutorial: tutorialName,
            duration: duration
        });
    }
    
    searchPerformed(searchQuery, resultCount) {
        this.analytics.trackEvent('feature', 'search_performed', {
            query: searchQuery,
            results: resultCount
        });
    }
    
    // =========================================================================
    // SOCIAL / SHARING
    // =========================================================================
    
    scoreShared(score, platform) {
        this.analytics.trackEvent('social', 'score_shared', {
            score: score,
            platform: platform
        });
    }
    
    feedbackSubmitted(rating, hasComment) {
        this.analytics.trackEvent('social', 'feedback_submitted', {
            rating: rating,
            hasComment: hasComment
        });
    }
}

// =========================================================================
// GLOBAL EXPORT
// =========================================================================

// Erstelle globale Instanz (wartet auf analyticsManager)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.analyticsManager) {
            window.analyticsEvents = new AnalyticsEvents(window.analyticsManager);
        }
    });
} else {
    if (window.analyticsManager) {
        window.analyticsEvents = new AnalyticsEvents(window.analyticsManager);
    } else {
        // Warte auf analyticsManager
        const checkManager = setInterval(() => {
            if (window.analyticsManager) {
                window.analyticsEvents = new AnalyticsEvents(window.analyticsManager);
                clearInterval(checkManager);
            }
        }, 100);
    }
}
