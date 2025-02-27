const { parseReaperProject } = require('reaper-project-parser');
const { DAWProject, Track, Clip, Plugin } = require('dawproject');

async function parseProToolsProject(buffer) {
    try {
        // Pro Tools session files are text-based and similar to Reaper's format
        // We'll use reaper-project-parser as a base and adapt it for Pro Tools
        const ptData = parseReaperProject(buffer.toString('utf8'));
        
        const project = new DAWProject({
            name: ptData.projectName,
            sampleRate: ptData.sampleRate,
            bitDepth: ptData.bitDepth,
            tempo: ptData.tempo,
            timeSignature: {
                numerator: ptData.timeSignature.num,
                denominator: ptData.timeSignature.den
            }
        });

        // Convert tracks
        ptData.tracks.forEach(ptTrack => {
            const track = new Track({
                name: ptTrack.name,
                type: convertProToolsTrackType(ptTrack.type),
                color: ptTrack.color,
                isMuted: ptTrack.muted,
                isSoloed: ptTrack.soloed,
                volume: convertProToolsVolume(ptTrack.volume),
                pan: ptTrack.pan
            });

            // Convert clips/regions
            ptTrack.regions.forEach(region => {
                const clip = new Clip({
                    name: region.name,
                    startTime: region.start,
                    duration: region.length,
                    startOffset: region.offset,
                    fadeIn: region.fadeIn,
                    fadeOut: region.fadeOut,
                    content: {
                        path: region.filePath,
                        type: region.type // 'audio' or 'midi'
                    }
                });
                track.addClip(clip);
            });

            // Convert plugins (inserts)
            ptTrack.inserts.forEach(insert => {
                if (insert.type === 'plugin') {
                    const plugin = new Plugin({
                        name: insert.name,
                        type: insert.format, // 'aax', 'rtas', etc.
                        manufacturer: insert.manufacturer,
                        parameters: convertProToolsPluginParams(insert.parameters)
                    });
                    track.addPlugin(plugin);
                }
            });

            // Convert automation
            ptTrack.automation.forEach(auto => {
                track.addAutomation({
                    target: auto.parameter,
                    points: auto.points.map(point => ({
                        time: point.time,
                        value: point.value,
                        curve: point.interpolation
                    }))
                });
            });

            project.addTrack(track);
        });

        // Convert routing (buses, sends, etc.)
        project.setRouting({
            inputs: ptData.inputs,
            outputs: ptData.outputs,
            sends: ptData.sends.map(send => ({
                source: send.from,
                destination: send.to,
                volume: convertProToolsVolume(send.volume),
                pan: send.pan
            }))
        });

        return project;
    } catch (error) {
        console.error('Error parsing Pro Tools project:', error);
        throw error;
    }
}

function convertProToolsTrackType(ptType) {
    const typeMap = {
        'audio': 'audio',
        'midi': 'midi',
        'aux': 'aux',
        'master': 'master',
        'folder': 'group',
        'instrument': 'instrument'
    };
    return typeMap[ptType] || 'unknown';
}

function convertProToolsVolume(dbValue) {
    // Convert Pro Tools dB value to linear gain
    return Math.pow(10, dbValue / 20);
}

function convertProToolsPluginParams(params) {
    return Object.entries(params).map(([name, data]) => ({
        name,
        value: data.value,
        automation: data.automation,
        min: data.range?.[0],
        max: data.range?.[1],
        default: data.default
    }));
}

module.exports = { parseProToolsProject }; 