const plist = require('plist');
const { DAWProject, Track, Clip, Plugin } = require('dawproject');
const yauzl = require('yauzl');
const { promisify } = require('util');

async function parseLogicProject(buffer) {
    try {
        // Logic projects are packages (directories) containing a project.plst file
        // For now, we'll assume we're getting the project.plst file directly
        const projectData = plist.parse(buffer.toString('utf8'));
        
        const project = new DAWProject({
            name: projectData.projectName,
            author: projectData.projectAuthor,
            tempo: projectData.tempo,
            timeSignature: {
                numerator: projectData.timeSignature.numerator,
                denominator: projectData.timeSignature.denominator
            }
        });

        // Convert tracks
        projectData.tracks.forEach(logicTrack => {
            const track = new Track({
                name: logicTrack.name,
                type: convertLogicTrackType(logicTrack.type),
                color: logicTrack.color,
                isMuted: logicTrack.mute,
                isSoloed: logicTrack.solo,
                volume: logicTrack.volume,
                pan: logicTrack.pan
            });

            // Convert regions to clips
            logicTrack.regions.forEach(region => {
                const clip = new Clip({
                    name: region.name,
                    startTime: region.startTime,
                    duration: region.length,
                    startOffset: region.offset,
                    isLooping: region.loop,
                    content: region.audioFile || region.midiData
                });
                track.addClip(clip);
            });

            // Convert plugins
            logicTrack.plugins.forEach(plugin => {
                const dawPlugin = new Plugin({
                    name: plugin.name,
                    type: plugin.type,
                    manufacturer: plugin.manufacturer,
                    parameters: convertLogicPluginParams(plugin.parameters)
                });
                track.addPlugin(dawPlugin);
            });

            // Convert automation
            if (logicTrack.automation) {
                logicTrack.automation.forEach(auto => {
                    track.addAutomation({
                        target: auto.parameter,
                        points: auto.points.map(point => ({
                            time: point.time,
                            value: point.value,
                            curve: point.curveType
                        }))
                    });
                });
            }

            project.addTrack(track);
        });

        // Add routing information
        if (projectData.routing) {
            project.setRouting({
                inputs: projectData.routing.inputs,
                outputs: projectData.routing.outputs,
                sends: projectData.routing.sends
            });
        }

        return project;
    } catch (error) {
        console.error('Error parsing Logic project:', error);
        throw error;
    }
}

function convertLogicTrackType(logicType) {
    const typeMap = {
        'audio': 'audio',
        'software': 'midi',
        'aux': 'aux',
        'folder': 'group',
        'master': 'master'
    };
    return typeMap[logicType] || 'unknown';
}

function convertLogicPluginParams(params) {
    return Object.entries(params).map(([name, data]) => ({
        name,
        value: data.value,
        normalized: data.normalized,
        automation: data.automation
    }));
}

module.exports = { parseLogicProject }; 